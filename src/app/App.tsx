import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MessagesProvider } from './context/MessagesContext';
import { NotificationsProvider } from './context/NotificationsContext';

function AppWithProviders() {
  const { user } = useAuth();
  const isTechnician = user?.userType === 'Técnico';

  return (
    <NotificationsProvider>
      <MessagesProvider isTechnician={isTechnician}>
        <RouterProvider router={router} />
      </MessagesProvider>
    </NotificationsProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppWithProviders />
    </AuthProvider>
  );
}
