import { NextFunction, Request, Response } from 'express';

export const ErrorMiddleware = (error, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';
    res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};
