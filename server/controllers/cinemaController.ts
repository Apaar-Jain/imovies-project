import { Request, Response } from 'express';
import { Cinema } from '../models/Cinema.ts';
import { Showtime } from '../models/Showtime.ts';

export async function getCinemas(req: Request, res: Response): Promise<void> {
  try {
    const { city } = req.query;
    const query: any = {};
    if (city && typeof city === 'string') {
      query.city = new RegExp(city.trim(), 'i');
    }

    const cinemas = await Cinema.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: cinemas.length,
      cinemas,
    });
  } catch (error: any) {
    console.error('Error fetching cinemas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch cinemas',
    });
  }
}

export async function getCinemaById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const cinema = await Cinema.findById(id);

    if (!cinema) {
      res.status(404).json({ success: false, message: 'Cinema not found' });
      return;
    }

    const now = new Date();
    const showtimes = await Showtime.find({
      cinema: cinema._id,
      startTime: { $gte: now },
    })
      .populate('movie', 'title posterUrl duration rating genre certificate')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      cinema,
      showtimes,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve cinema details',
    });
  }
}

export async function createCinema(req: Request, res: Response): Promise<void> {
  try {
    const { name, address, city, screens, amenities, phone } = req.body;

    if (!name || !address || !city) {
      res.status(400).json({
        success: false,
        message: 'Name, address, and city are required',
      });
      return;
    }

    const defaultScreens = screens && screens.length > 0 ? screens : [
      { screenId: 'SCR-1', name: 'Audi 1 (IMAX 3D)', screenType: 'IMAX 3D', totalSeats: 60, rows: 6, cols: 10 },
      { screenId: 'SCR-2', name: 'Audi 2 (Dolby Atmos)', screenType: 'Dolby Cinema', totalSeats: 60, rows: 6, cols: 10 },
    ];

    const cinema = await Cinema.create({
      name,
      address,
      city,
      screens: defaultScreens,
      amenities: amenities || ['Dolby Atmos', '4K Projection', 'Food & Beverages'],
      phone: phone || '+1 (800) 555-FILM',
    });

    res.status(201).json({
      success: true,
      message: 'Cinema created successfully',
      cinema,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create cinema',
    });
  }
}

export async function updateCinema(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const cinema = await Cinema.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!cinema) {
      res.status(404).json({ success: false, message: 'Cinema not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Cinema updated successfully',
      cinema,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update cinema',
    });
  }
}

export async function deleteCinema(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const cinema = await Cinema.findByIdAndDelete(id);

    if (!cinema) {
      res.status(404).json({ success: false, message: 'Cinema not found' });
      return;
    }

    await Showtime.deleteMany({ cinema: id });

    res.status(200).json({
      success: true,
      message: 'Cinema and associated showtimes removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete cinema',
    });
  }
}
