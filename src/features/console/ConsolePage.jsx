import { useParams, useNavigate } from 'react-router-dom';
import ProtectedRoute from '../../shared/components/ProtectedRoute';
import ConsoleNav from './components/ConsoleNav';
import ProjectsTab from './components/ProjectsTab';
import AccountTab from './components/AccountTab';
import BillingTab from './components/BillingTab';
import './console.css';
import '../auth/auth.css';

const TABS = [
  { id: 'projects', label: 'Projects' },
  { id: 'account', label: 'Account' },
  { id: 'billing', label: 'Billing' },
];

function ConsoleContent() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || 'projects';

  return (
    <div className="console-page">
      <ConsoleNav />
      <div className="console-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`console-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => navigate(t.id === 'projects' ? '/console' : `/console/${t.id}`)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="console-content">
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'billing' && <BillingTab />}
      </div>
    </div>
  );
}

export default function ConsolePage() {
  return (
    <ProtectedRoute>
      <ConsoleContent />
    </ProtectedRoute>
  );
}
