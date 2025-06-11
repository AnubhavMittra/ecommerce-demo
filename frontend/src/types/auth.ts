export interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  login: (token: string, user: any) => void;
  logout: () => void;
}
