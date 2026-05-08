import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  ArrowLeft,
  Save,
  Plus,
  X,
  Clock,
  DollarSign,
  Briefcase,
  Award,
  Home,
  MapPinned,
  Star,
  Edit2,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
}

interface WorkingHours {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
}

export default function TechnicianProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Datos básicos
  const [basicInfo, setBasicInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    whatsapp: '+52 55 1234 5678',
    location: user?.location || 'Ciudad de México',
  });

  // Información profesional
  const [professionalInfo, setProfessionalInfo] = useState({
    specialty: 'Electricista',
    yearsOfExperience: 5,
    bio: 'Técnico especializado en instalaciones eléctricas residenciales y comerciales. Trabajo con profesionalismo y garantía.',
    certifications: ['CFE Certificado', 'Instalaciones Residenciales', 'Sistemas de Seguridad'],
  });

  // Tarifas
  const [rates, setRates] = useState({
    hourlyRate: 350,
    visitFee: 200,
    emergencyRate: 500,
  });

  // Servicios
  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'Instalación eléctrica completa', price: 3500, duration: '4-6 horas' },
    { id: '2', name: 'Reparación de contactos', price: 450, duration: '1 hora' },
    { id: '3', name: 'Cambio de luminarias', price: 600, duration: '1-2 horas' },
    { id: '4', name: 'Instalación de ventiladores', price: 800, duration: '2 horas' },
  ]);

  // Horarios de trabajo
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([
    { day: 'Lunes', enabled: true, start: '08:00', end: '18:00' },
    { day: 'Martes', enabled: true, start: '08:00', end: '18:00' },
    { day: 'Miércoles', enabled: true, start: '08:00', end: '18:00' },
    { day: 'Jueves', enabled: true, start: '08:00', end: '18:00' },
    { day: 'Viernes', enabled: true, start: '08:00', end: '18:00' },
    { day: 'Sábado', enabled: true, start: '09:00', end: '14:00' },
    { day: 'Domingo', enabled: false, start: '09:00', end: '14:00' },
  ]);

  // Áreas de cobertura
  const [coverageAreas, setCoverageAreas] = useState([
    'Ciudad de México',
    'Benito Juárez',
    'Coyoacán',
    'Álvaro Obregón',
    'Miguel Hidalgo',
  ]);

  // Estados de edición
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [isEditingCoverage, setIsEditingCoverage] = useState(false);

  // Nuevos campos temporales
  const [newCertification, setNewCertification] = useState('');
  const [newService, setNewService] = useState({ name: '', price: 0, duration: '' });
  const [newArea, setNewArea] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setProfessionalInfo({
        ...professionalInfo,
        certifications: [...professionalInfo.certifications, newCertification.trim()],
      });
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index: number) => {
    setProfessionalInfo({
      ...professionalInfo,
      certifications: professionalInfo.certifications.filter((_, i) => i !== index),
    });
  };

  const handleAddService = () => {
    if (newService.name && newService.price > 0 && newService.duration) {
      setServices([
        ...services,
        { id: Date.now().toString(), ...newService },
      ]);
      setNewService({ name: '', price: 0, duration: '' });
    }
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleAddArea = () => {
    if (newArea.trim() && !coverageAreas.includes(newArea.trim())) {
      setCoverageAreas([...coverageAreas, newArea.trim()]);
      setNewArea('');
    }
  };

  const handleRemoveArea = (area: string) => {
    setCoverageAreas(coverageAreas.filter(a => a !== area));
  };

  const handleWorkingHourChange = (index: number, field: keyof WorkingHours, value: any) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingHours(updated);
  };

  const handleSaveBasicInfo = () => {
    if (updateUser) {
      updateUser({ name: basicInfo.name, email: basicInfo.email, phone: basicInfo.phone, location: basicInfo.location });
    }
    setIsEditingBasic(false);
    showSuccess('Información básica actualizada correctamente');
  };

  const handleSaveProfessionalInfo = () => {
    setIsEditingProfessional(false);
    showSuccess('Información profesional actualizada correctamente');
  };

  const handleSaveRates = () => {
    setIsEditingRates(false);
    showSuccess('Tarifas actualizadas correctamente');
  };

  const handleSaveServices = () => {
    setIsEditingServices(false);
    showSuccess('Servicios actualizados correctamente');
  };

  const handleSaveHours = () => {
    setIsEditingHours(false);
    showSuccess('Horario actualizado correctamente');
  };

  const handleSaveCoverage = () => {
    setIsEditingCoverage(false);
    showSuccess('Áreas de cobertura actualizadas correctamente');
  };

  const specialties = [
    'Electricista',
    'Plomero',
    'Carpintero',
    'Técnico de Climatización',
    'Cerrajero',
    'Pintor',
    'Herrero',
    'Gasista',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/technician/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al panel</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {successMessage}
          </div>
        )}

        {/* Profile Header Card */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl mb-1">{basicInfo.name}</h1>
              <p className="text-gray-600 mb-3">{professionalInfo.specialty}</p>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">4.9</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">127 trabajos completados</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {professionalInfo.yearsOfExperience} años de experiencia
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Verificado
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Básica */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Básica
              </h2>
              {!isEditingBasic ? (
                <Button onClick={() => setIsEditingBasic(true)} variant="outline" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveBasicInfo} size="sm">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => setIsEditingBasic(false)} variant="outline" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  disabled={!isEditingBasic}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={basicInfo.email}
                  onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                  disabled={!isEditingBasic}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={basicInfo.phone}
                  onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                  disabled={!isEditingBasic}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={basicInfo.whatsapp}
                  onChange={(e) => setBasicInfo({ ...basicInfo, whatsapp: e.target.value })}
                  disabled={!isEditingBasic}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación principal</Label>
                <Input
                  id="location"
                  value={basicInfo.location}
                  onChange={(e) => setBasicInfo({ ...basicInfo, location: e.target.value })}
                  disabled={!isEditingBasic}
                />
              </div>
            </div>
          </Card>

          {/* Información Profesional */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Información Profesional
              </h2>
              {!isEditingProfessional ? (
                <Button onClick={() => setIsEditingProfessional(true)} variant="outline" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfessionalInfo} size="sm">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => setIsEditingProfessional(false)} variant="outline" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad</Label>
                <select
                  id="specialty"
                  value={professionalInfo.specialty}
                  onChange={(e) => setProfessionalInfo({ ...professionalInfo, specialty: e.target.value })}
                  disabled={!isEditingProfessional}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Años de experiencia</Label>
                <Input
                  id="experience"
                  type="number"
                  value={professionalInfo.yearsOfExperience}
                  onChange={(e) => setProfessionalInfo({ ...professionalInfo, yearsOfExperience: parseInt(e.target.value) })}
                  disabled={!isEditingProfessional}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Descripción de servicios</Label>
                <textarea
                  id="bio"
                  value={professionalInfo.bio}
                  onChange={(e) => setProfessionalInfo({ ...professionalInfo, bio: e.target.value })}
                  disabled={!isEditingProfessional}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  <Award className="w-4 h-4 inline mr-1" />
                  Certificaciones
                </Label>
                <div className="space-y-2">
                  {professionalInfo.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex-1">
                        {cert}
                      </Badge>
                      {isEditingProfessional && (
                        <Button
                          onClick={() => handleRemoveCertification(index)}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {isEditingProfessional && (
                    <div className="flex gap-2">
                      <Input
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="Nueva certificación"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCertification()}
                      />
                      <Button onClick={handleAddCertification} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Tarifas */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Tarifas
              </h2>
              {!isEditingRates ? (
                <Button onClick={() => setIsEditingRates(true)} variant="outline" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveRates} size="sm">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => setIsEditingRates(false)} variant="outline" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Tarifa por hora (MXN)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={rates.hourlyRate}
                    onChange={(e) => setRates({ ...rates, hourlyRate: parseInt(e.target.value) })}
                    disabled={!isEditingRates}
                    className="pl-7"
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitFee">Tarifa de visita (MXN)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="visitFee"
                    type="number"
                    value={rates.visitFee}
                    onChange={(e) => setRates({ ...rates, visitFee: parseInt(e.target.value) })}
                    disabled={!isEditingRates}
                    className="pl-7"
                    min={0}
                  />
                </div>
                <p className="text-xs text-gray-500">Cobro por acudir al domicilio</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyRate">Tarifa de emergencia (MXN)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="emergencyRate"
                    type="number"
                    value={rates.emergencyRate}
                    onChange={(e) => setRates({ ...rates, emergencyRate: parseInt(e.target.value) })}
                    disabled={!isEditingRates}
                    className="pl-7"
                    min={0}
                  />
                </div>
                <p className="text-xs text-gray-500">Servicios urgentes fuera de horario</p>
              </div>
            </div>
          </Card>

          {/* Horario de trabajo */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horario de Trabajo
              </h2>
              {!isEditingHours ? (
                <Button onClick={() => setIsEditingHours(true)} variant="outline" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveHours} size="sm">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => setIsEditingHours(false)} variant="outline" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {workingHours.map((schedule, index) => (
                <div key={schedule.day} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={schedule.enabled}
                    onChange={(e) => handleWorkingHourChange(index, 'enabled', e.target.checked)}
                    disabled={!isEditingHours}
                    className="w-4 h-4"
                  />
                  <span className="w-24 text-sm">{schedule.day}</span>
                  {schedule.enabled ? (
                    <>
                      <Input
                        type="time"
                        value={schedule.start}
                        onChange={(e) => handleWorkingHourChange(index, 'start', e.target.value)}
                        disabled={!isEditingHours}
                        className="flex-1"
                      />
                      <span className="text-gray-500">-</span>
                      <Input
                        type="time"
                        value={schedule.end}
                        onChange={(e) => handleWorkingHourChange(index, 'end', e.target.value)}
                        disabled={!isEditingHours}
                        className="flex-1"
                      />
                    </>
                  ) : (
                    <span className="flex-1 text-sm text-gray-400">No disponible</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Servicios ofrecidos - Full width */}
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Servicios Ofrecidos
            </h2>
            {!isEditingServices ? (
              <Button onClick={() => setIsEditingServices(true)} variant="outline" size="sm">
                <Edit2 className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSaveServices} size="sm">
                  <Check className="w-4 h-4" />
                </Button>
                <Button onClick={() => setIsEditingServices(false)} variant="outline" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-gray-600">Duración: {service.duration}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-green-600">${service.price}</span>
                  {isEditingServices && (
                    <Button onClick={() => handleRemoveService(service.id)} variant="ghost" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {isEditingServices && (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h3 className="text-sm font-medium mb-3">Agregar nuevo servicio</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    placeholder="Nombre del servicio"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="md:col-span-2"
                  />
                  <Input
                    type="number"
                    placeholder="Precio (MXN)"
                    value={newService.price || ''}
                    onChange={(e) => setNewService({ ...newService, price: parseInt(e.target.value) })}
                  />
                  <Input
                    placeholder="Duración"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                  />
                  <Button onClick={handleAddService} className="md:col-span-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar servicio
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Áreas de cobertura - Full width */}
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl flex items-center gap-2">
              <MapPinned className="w-5 h-5" />
              Áreas de Cobertura
            </h2>
            {!isEditingCoverage ? (
              <Button onClick={() => setIsEditingCoverage(true)} variant="outline" size="sm">
                <Edit2 className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSaveCoverage} size="sm">
                  <Check className="w-4 h-4" />
                </Button>
                <Button onClick={() => setIsEditingCoverage(false)} variant="outline" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {coverageAreas.map((area) => (
              <Badge key={area} variant="secondary" className="text-sm py-2 px-3">
                <MapPin className="w-3 h-3 mr-1 inline" />
                {area}
                {isEditingCoverage && (
                  <button
                    onClick={() => handleRemoveArea(area)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="w-3 h-3 inline" />
                  </button>
                )}
              </Badge>
            ))}
          </div>

          {isEditingCoverage && (
            <div className="flex gap-2">
              <Input
                placeholder="Agregar nueva área (ej. Polanco, Roma Norte)"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddArea()}
              />
              <Button onClick={handleAddArea}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
