import {
  IonSearchbar,
  IonButton,
  IonIcon,
  IonAvatar,
  IonPopover,
  IonContent,
  IonCheckbox,
  IonItem,
  IonLabel,
  IonDatetime,
} from '@ionic/react';
import {
  filterOutline,
  downloadOutline,
  arrowDownOutline,
  chevronDownOutline,
  addOutline,
} from 'ionicons/icons';
import { useTaskStore } from '../store/taskStore';
import { useState } from 'react';

export const Header: React.FC = () => {
  const { filter, setSearchQuery, setLabelFilter, setAssigneeFilter, clearFilters } =
    useTaskStore();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(filter.labels);

  const labelOptions = ['Feature', 'Bug', 'Issue', 'Undefined'];

  const handleLabelChange = (label: string, checked: boolean) => {
    const updated = checked ? [...selectedLabels, label] : selectedLabels.filter((l) => l !== label);
    setSelectedLabels(updated);
    setLabelFilter(updated);
  };

  const avatars = [
    { initials: 'JD', color: 'bg-blue-500' },
    { initials: 'MS', color: 'bg-green-500' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Board name and dropdown */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
          <h1 className="text-xl font-semibold text-gray-900">Kanban Board</h1>
          <IonIcon icon={chevronDownOutline} className="text-gray-600" />
        </div>

        {/* Team avatars */}
        <div className="flex items-center ml-4">
          {avatars.map((avatar, index) => (
            <IonAvatar
              key={index}
              className={`${avatar.color} w-8 h-8 text-white text-xs font-semibold -ml-2 border-2 border-white flex items-center justify-center`}
            >
              {avatar.initials}
            </IonAvatar>
          ))}
          <span className="text-xs text-gray-500 ml-2 font-medium">+2</span>
        </div>
      </div>

      {/* Center: Search bar */}
      <div className="flex-1 mx-6">
        <IonSearchbar
          value={filter.searchQuery}
          onIonInput={(e) => setSearchQuery(e.detail.value || '')}
          placeholder="Search tasks..."
          mode="ios"
          className="bg-gray-100 rounded-lg"
          style={{
            '--background': '#f3f4f6',
            '--color': '#1f2937',
            '--placeholder-color': '#9ca3af',
          } as any}
        />
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-2">
        <IonButton
          fill="solid"
          color="primary"
          size="default"
          className="hidden sm:inline-block"
        >
          Invite
        </IonButton>

        {/* Filter button */}
        <IonButton
          fill="outline"
          color="medium"
          size="default"
          id="filter-button"
          onClick={() => setFilterOpen(true)}
        >
          <IonIcon slot="start" icon={filterOutline} />
          Filter
        </IonButton>

        {/* Export/Import buttons */}
        <IonButton fill="outline" color="medium" size="default">
          <IonIcon icon={downloadOutline} />
        </IonButton>

        <IonButton fill="outline" color="medium" size="default">
          <IonIcon icon={arrowDownOutline} />
        </IonButton>

        {/* Filter Popover */}
        <IonPopover
          isOpen={filterOpen}
          onDidDismiss={() => setFilterOpen(false)}
          trigger="filter-button"
          side="bottom"
          alignment="end"
        >
          <IonContent className="w-64">
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Labels</h3>
                {labelOptions.map((label) => (
                  <IonItem key={label} lines="none" className="pl-0">
                    <IonCheckbox
                      slot="start"
                      checked={selectedLabels.includes(label)}
                      onIonChange={(e) => handleLabelChange(label, e.detail.checked)}
                    />
                    <IonLabel>{label}</IonLabel>
                  </IonItem>
                ))}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Due Date</h3>
                <IonDatetime
                  presentation="date"
                  placeholder="Select date"
                  style={{ '--placeholder-color': '#9ca3af' } as any}
                />
              </div>

              <button
                onClick={() => clearFilters()}
                className="w-full py-2 px-3 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium transition"
              >
                Clear Filters
              </button>
            </div>
          </IonContent>
        </IonPopover>
      </div>
    </div>
  );
};
