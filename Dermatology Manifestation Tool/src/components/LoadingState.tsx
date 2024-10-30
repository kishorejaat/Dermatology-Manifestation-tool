import { Loader2 } from "lucide-react";

export const LoadingState = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <Loader2 className="h-8 w-8 animate-spin text-medical-dark" />
      <p className="text-lg text-gray-600 animate-pulse-opacity">{message}</p>
    </div>
  );
};