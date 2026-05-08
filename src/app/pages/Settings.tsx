import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Bell, 
  Lock, 
  Globe, 
  Moon, 
  Eye, 
  Shield, 
  Trash2,
  Mail,
  MessageSquare,
  BellRing
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export function Settings() {
  const navigate = useNavigate();

  // Notification Settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    bookingConfirmation: true,
    bookingReminder: true,
    newMessages: true,
    promotions: false,
    newsletter: true,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: true,
    allowReviews: true,
  });

  // App Settings
  const [language, setLanguage] = useState('es');
  const [theme, setTheme] = useState('light');
  const [currency, setCurrency] = useState('MXN');

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      // Lógica para eliminar cuenta
      alert('Funcionalidad de eliminación de cuenta');
    }
  };

  const handleExportData = () => {
    alert('Tus datos serán exportados y enviados a tu correo electrónico.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl mb-2">Configuración</h1>
        <p className="text-gray-600 mb-8">Personaliza tu experiencia en Tecno-Connect</p>

        {/* Notifications Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl">Notificaciones</h2>
              <p className="text-sm text-gray-600">Gestiona cómo recibes las notificaciones</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Notification Channels */}
            <div>
              <h3 className="text-sm mb-4 text-gray-700">Canales de notificación</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label htmlFor="email-notif">Notificaciones por email</Label>
                      <p className="text-xs text-gray-500">Recibe actualizaciones en tu correo</p>
                    </div>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={notifications.email}
                    onCheckedChange={() => handleNotificationChange('email')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BellRing className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label htmlFor="push-notif">Notificaciones push</Label>
                      <p className="text-xs text-gray-500">Recibe alertas en tiempo real</p>
                    </div>
                  </div>
                  <Switch
                    id="push-notif"
                    checked={notifications.push}
                    onCheckedChange={() => handleNotificationChange('push')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label htmlFor="sms-notif">Notificaciones SMS</Label>
                      <p className="text-xs text-gray-500">Recibe mensajes de texto</p>
                    </div>
                  </div>
                  <Switch
                    id="sms-notif"
                    checked={notifications.sms}
                    onCheckedChange={() => handleNotificationChange('sms')}
                  />
                </div>
              </div>
            </div>

            {/* Notification Types */}
            <div className="border-t pt-6">
              <h3 className="text-sm mb-4 text-gray-700">Tipos de notificación</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="booking-conf">Confirmaciones de contratación</Label>
                  <Switch
                    id="booking-conf"
                    checked={notifications.bookingConfirmation}
                    onCheckedChange={() => handleNotificationChange('bookingConfirmation')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="booking-reminder">Recordatorios de citas</Label>
                  <Switch
                    id="booking-reminder"
                    checked={notifications.bookingReminder}
                    onCheckedChange={() => handleNotificationChange('bookingReminder')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="new-messages">Nuevos mensajes</Label>
                  <Switch
                    id="new-messages"
                    checked={notifications.newMessages}
                    onCheckedChange={() => handleNotificationChange('newMessages')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="promotions">Promociones y ofertas</Label>
                  <Switch
                    id="promotions"
                    checked={notifications.promotions}
                    onCheckedChange={() => handleNotificationChange('promotions')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="newsletter">Newsletter semanal</Label>
                  <Switch
                    id="newsletter"
                    checked={notifications.newsletter}
                    onCheckedChange={() => handleNotificationChange('newsletter')}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl">Privacidad</h2>
              <p className="text-sm text-gray-600">Controla la visibilidad de tu información</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profile-visible">Perfil público</Label>
                <p className="text-xs text-gray-500">Permite que otros usuarios vean tu perfil</p>
              </div>
              <Switch
                id="profile-visible"
                checked={privacy.profileVisible}
                onCheckedChange={() => handlePrivacyChange('profileVisible')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-email">Mostrar email</Label>
                <p className="text-xs text-gray-500">Visible en tu perfil público</p>
              </div>
              <Switch
                id="show-email"
                checked={privacy.showEmail}
                onCheckedChange={() => handlePrivacyChange('showEmail')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-phone">Mostrar teléfono</Label>
                <p className="text-xs text-gray-500">Visible en tu perfil público</p>
              </div>
              <Switch
                id="show-phone"
                checked={privacy.showPhone}
                onCheckedChange={() => handlePrivacyChange('showPhone')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-reviews">Permitir reseñas</Label>
                <p className="text-xs text-gray-500">Los clientes pueden dejar comentarios</p>
              </div>
              <Switch
                id="allow-reviews"
                checked={privacy.allowReviews}
                onCheckedChange={() => handlePrivacyChange('allowReviews')}
              />
            </div>
          </div>
        </Card>

        {/* Appearance Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Eye className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl">Apariencia</h2>
              <p className="text-sm text-gray-600">Personaliza el aspecto de la aplicación</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="theme" className="mb-2 block">Tema</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Language & Region Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl">Idioma y región</h2>
              <p className="text-sm text-gray-600">Configura tu idioma y moneda preferida</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="language" className="mb-2 block">Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency" className="mb-2 block">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="MXN">MXN ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Data & Security Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Lock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl">Datos y seguridad</h2>
              <p className="text-sm text-gray-600">Gestiona tu información personal</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
              <span className="mr-auto">Exportar mis datos</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              <span className="mr-auto">Eliminar mi cuenta</span>
            </Button>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg" onClick={() => {
            alert('Configuración guardada correctamente');
          }}>
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}