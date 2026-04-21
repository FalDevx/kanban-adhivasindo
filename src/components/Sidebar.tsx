import {
  IonIcon,
} from '@ionic/react';
import {
  gridOutline,
  listOutline,
  calendarOutline,
  documentOutline,
  settingsOutline,
  helpCircleOutline,
  archiveOutline,
  lockOpenOutline,
} from 'ionicons/icons';

export const Sidebar: React.FC = () => {

  const navItems = [
    { icon: gridOutline, label: 'Dashboard', path: '/' },
    { icon: listOutline, label: 'Tasks', path: '/tasks' },
    { icon: calendarOutline, label: 'Calendar', path: '/calendar' },
    { icon: documentOutline, label: 'Files', path: '/files' },
    { icon: settingsOutline, label: 'Settings', path: '/settings' },
  ];

  const bottomItems = [
    { icon: helpCircleOutline, label: 'Help' },
    { icon: archiveOutline, label: 'Archive' },
  ];

  return (
    <div className="h-screen w-full bg-sidebar text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
            <IonIcon icon={lockOpenOutline} className="text-white text-lg" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">Adhivasindo</div>
            <div className="text-xs text-gray-400 leading-none">PRODUCTIVITY</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <div
            key={item.path}
            className="flex items-center gap-3 px-4 py-3 transition-colors text-gray-300 hover:text-white hover:bg-gray-700/50 cursor-pointer"
          >
            <IonIcon icon={item.icon} className="text-xl flex-shrink-0" />
            <span className="text-sm truncate">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-700 p-4 space-y-3">
        {bottomItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded cursor-pointer transition-colors text-sm"
          >
            <IonIcon icon={item.icon} className="text-lg flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </div>
        ))}

        {/* New Project Button */}
        <button className="w-full mt-2 py-2 px-4 bg-primary hover:bg-blue-700 text-white rounded font-medium text-sm transition">
          + New Project
        </button>
      </div>
    </div>
  );
};
