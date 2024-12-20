export interface ConnectionStatusProps {
  status: number;
  error: string;
  errorDetails: string;
  isLoading: boolean;
}

export const defaultConnectionStatus = {
  status: 200,
  error: '',
  errorDetails: '',
  isLoading: false,
};
