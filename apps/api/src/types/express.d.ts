declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        mobileNumber: string;
        effectiveRole: string;
        societyId: string | null;
      };
    }
  }
}

export {};
