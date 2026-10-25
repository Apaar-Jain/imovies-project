import { Request, Response } from 'express';
import { Movie } from '../models/Movie.ts';
import { Showtime } from '../models/Showtime.ts';

export async function getMovies(req: Request, res: Response): Promise<void> {
  try {
    const { search, genre, status, featured, sort } = req.query;

    const query: any = {};

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { director: searchRegex },
        { cast: searchRegex },
      ];
    }

    if (genre && typeof genre === 'string' && genre !== 'All') {
      query.genre = { $in: [genre] };
    }

    if (status && typeof status === 'string' && status !== 'all') {
      query.status = status;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'rating_desc') {
      sortOption = { rating: -1 };
    } else if (sort === 'release_desc') {
      sortOption = { releaseDate: -1 };
    } else if (sort === 'title_asc') {
      sortOption = { title: 1 };
    }

    const movies = await Movie.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error: any) {
    console.error('Error fetching movies:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch movies',
    });
  }
}

export async function getMovieById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);

    if (!movie) {
      res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
      return;
    }

    // Also get active future showtimes for this movie
    const now = new Date();
    const showtimes = await Showtime.find({
      movie: movie._id,
      startTime: { $gte: now },
    })
      .populate('cinema', 'name city address screens amenities')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      movie,
      showtimes,
    });
  } catch (error: any) {
    console.error('Error fetching movie:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve movie details',
    });
  }
}

export async function createMovie(req: Request, res: Response): Promise<void> {
  try {
    const {
      title,
      description,
      posterUrl,
      backdropUrl,
      genre,
      duration,
      releaseDate,
      language,
      rating,
      certificate,
      cast,
      director,
      trailerUrl,
      status,
      featured,
    } = req.body;

    if (!title || !description || !posterUrl || !duration) {
      res.status(400).json({
        success: false,
        message: 'Title, description, posterUrl, and duration are required',
      });
      return;
    }

    const movie = await Movie.create({
      title,
      description,
      posterUrl,
      backdropUrl: backdropUrl || posterUrl,
      genre: Array.isArray(genre) ? genre : [genre || 'Action'],
      duration: Number(duration),
      releaseDate: releaseDate || new Date().toISOString().split('T')[0],
      language: language || 'English',
      rating: rating ? Number(rating) : 8.0,
      certificate: certificate || 'PG-13',
      cast: Array.isArray(cast) ? cast : typeof cast === 'string' ? cast.split(',').map((s) => s.trim()) : [],
      director: director || 'Director',
      trailerUrl: trailerUrl || '',
      status: status || 'now_showing',
      featured: Boolean(featured),
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      movie,
    });
  } catch (error: any) {
    console.error('Error creating movie:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create movie',
    });
  }
}

export async function updateMovie(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.genre && typeof updates.genre === 'string') {
      updates.genre = updates.genre.split(',').map((g: string) => g.trim());
    }
    if (updates.cast && typeof updates.cast === 'string') {
      updates.cast = updates.cast.split(',').map((c: string) => c.trim());
    }

    const movie = await Movie.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      res.status(404).json({ success: false, message: 'Movie not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      movie,
    });
  } catch (error: any) {
    console.error('Error updating movie:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update movie',
    });
  }
}

export async function deleteMovie(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const movie = await Movie.findByIdAndDelete(id);

    if (!movie) {
      res.status(404).json({ success: false, message: 'Movie not found' });
      return;
    }

    // Delete associated showtimes
    await Showtime.deleteMany({ movie: id });

    res.status(200).json({
      success: true,
      message: 'Movie and associated showtimes removed successfully',
    });
  } catch (error: any) {
    console.error('Error deleting movie:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete movie',
    });
  }
}
