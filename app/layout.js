import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { QueryProvider } from "@/context/QueryProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
