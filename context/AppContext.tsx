import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppNotification,
  ContactChannel,
  IntroRequest,
  INITIAL_INTROS,
  INITIAL_NOTIFICATIONS,
  ME,
  Person,
  SavedCategory,
  getPerson,
} from '@/constants/mockData';

const ONBOARDING_KEY = 'mycircle.onboarding.v1';

export type ContactsPermissionState = 'undetermined' | 'granted' | 'denied';

export type AccountState = {
  phone: string;
  contactsPermission: ContactsPermissionState;
  contactChannel: ContactChannel;
  contactHandle: string;
};

export type SavedPerson = {
  personId: string;
  category: SavedCategory;
  note?: string;
};

export type NotificationSettings = {
  newConnections: boolean;
  professional: boolean;
  sharedInterests: boolean;
  localDiscoveries: boolean;
  verification: boolean;
};

export type PrivacySettings = {
  showProfession: boolean;
  showInterests: boolean;
  allowFoFDiscovery: boolean;
  allowIntroRequests: boolean;
  shareProfessionalConnections: boolean;
  /** Appear as “Confidential” to friends-of-friends */
  ghostToSecond: boolean;
};

type ProfileState = {
  name: string;
  location: string;
  profession: string;
  bio: string;
  interests: string[];
};

type AppContextValue = {
  onboardingReady: boolean;
  hasSignedUp: boolean;
  hasCompletedHowTo: boolean;
  account: AccountState;
  completeSignup: (account: AccountState) => Promise<void>;
  completeHowTo: (accountOverride?: AccountState) => Promise<void>;
  /** Web marketing path: signup + skip how-to in one step */
  enterFromLanding: (account: AccountState) => Promise<void>;
  updateAccount: (patch: Partial<AccountState>) => void;
  profile: ProfileState;
  updateProfile: (patch: Partial<ProfileState>) => void;
  saved: SavedPerson[];
  rememberPerson: (personId: string, category?: SavedCategory) => void;
  removeSaved: (personId: string) => void;
  moveSaved: (personId: string, category: SavedCategory) => void;
  isSaved: (personId: string) => boolean;
  intros: IntroRequest[];
  pendingIntroCount: number;
  respondIntro: (id: string, status: 'accepted' | 'declined') => void;
  requestIntro: (personId: string, reason: string) => void;
  notifications: AppNotification[];
  markNotificationsRead: () => void;
  unreadCount: number;
  notificationSettings: NotificationSettings;
  toggleNotificationSetting: (key: keyof NotificationSettings) => void;
  privacy: PrivacySettings;
  togglePrivacy: (key: keyof PrivacySettings) => void;
  recentConnections: string[];
  addConnection: (personId: string) => void;
  toast: string | null;
  showToast: (message: string) => void;
  clearToast: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_ACCOUNT: AccountState = {
  phone: '',
  contactsPermission: 'undetermined',
  contactChannel: 'whatsapp',
  contactHandle: '',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [onboardingReady, setOnboardingReady] = useState(false);
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [hasCompletedHowTo, setHasCompletedHowTo] = useState(false);
  const [account, setAccount] = useState<AccountState>(DEFAULT_ACCOUNT);
  const [profile, setProfile] = useState<ProfileState>({
    name: ME.name,
    location: ME.location,
    profession: ME.profession,
    bio: ME.bio,
    interests: ME.interests,
  });
  const [saved, setSaved] = useState<SavedPerson[]>([
    { personId: 'david', category: 'Automotive', note: 'Saved through Rahul.' },
    { personId: 'alex-morgan', category: 'Hair & Beauty', note: 'Saved through Misha.' },
    { personId: 'michael', category: 'Restaurants & Bars', note: 'Saved through James.' },
  ]);
  const [intros, setIntros] = useState<IntroRequest[]>(INITIAL_INTROS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    newConnections: true,
    professional: true,
    sharedInterests: true,
    localDiscoveries: true,
    verification: true,
  });
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showProfession: true,
    showInterests: true,
    allowFoFDiscovery: true,
    allowIntroRequests: true,
    shareProfessionalConnections: true,
    ghostToSecond: false,
  });
  const [recentConnections, setRecentConnections] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (cancelled) return;
        if (raw) {
          const parsed = JSON.parse(raw) as {
            hasSignedUp?: boolean;
            hasCompletedHowTo?: boolean;
            account?: Partial<AccountState>;
          };
          setHasSignedUp(!!parsed.hasSignedUp);
          setHasCompletedHowTo(!!parsed.hasCompletedHowTo);
          if (parsed.account) {
            setAccount({ ...DEFAULT_ACCOUNT, ...parsed.account });
          }
        }
      } catch {
        /* ignore corrupt storage */
      } finally {
        if (!cancelled) setOnboardingReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistOnboarding = useCallback(
    async (next: {
      hasSignedUp: boolean;
      hasCompletedHowTo: boolean;
      account: AccountState;
    }) => {
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(next));
    },
    []
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2400);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const updateAccount = useCallback((patch: Partial<AccountState>) => {
    setAccount((prev) => ({ ...prev, ...patch }));
  }, []);

  const completeSignup = useCallback(
    async (nextAccount: AccountState) => {
      setAccount(nextAccount);
      setHasSignedUp(true);
      await persistOnboarding({
        hasSignedUp: true,
        hasCompletedHowTo: false,
        account: nextAccount,
      });
      showToast('Account ready');
    },
    [persistOnboarding, showToast]
  );

  const completeHowTo = useCallback(
    async (accountOverride?: AccountState) => {
      const nextAccount = accountOverride ?? account;
      if (accountOverride) setAccount(accountOverride);
      setHasCompletedHowTo(true);
      await persistOnboarding({
        hasSignedUp: true,
        hasCompletedHowTo: true,
        account: nextAccount,
      });
    },
    [account, persistOnboarding]
  );

  const enterFromLanding = useCallback(
    async (nextAccount: AccountState) => {
      setAccount(nextAccount);
      setHasSignedUp(true);
      setHasCompletedHowTo(true);
      await persistOnboarding({
        hasSignedUp: true,
        hasCompletedHowTo: true,
        account: nextAccount,
      });
      showToast('Account ready');
    },
    [persistOnboarding, showToast]
  );

  const updateProfile = useCallback((patch: Partial<ProfileState>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const rememberPerson = useCallback(
    (personId: string, category?: SavedCategory) => {
      const person = getPerson(personId);
      setSaved((prev) => {
        if (prev.some((s) => s.personId === personId)) return prev;
        return [
          ...prev,
          {
            personId,
            category: category || person?.category || 'Other',
            note: person?.via ? `Saved through ${person.via}.` : 'Saved from Discover.',
          },
        ];
      });
      showToast('Saved to Remember for Later');
    },
    [showToast]
  );

  const removeSaved = useCallback(
    (personId: string) => {
      setSaved((prev) => prev.filter((s) => s.personId !== personId));
      showToast('Removed from saved');
    },
    [showToast]
  );

  const moveSaved = useCallback((personId: string, category: SavedCategory) => {
    setSaved((prev) =>
      prev.map((s) => (s.personId === personId ? { ...s, category } : s))
    );
  }, []);

  const isSaved = useCallback(
    (personId: string) => saved.some((s) => s.personId === personId),
    [saved]
  );

  const respondIntro = useCallback(
    (id: string, status: 'accepted' | 'declined') => {
      setIntros((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      showToast(status === 'accepted' ? 'Introduction approved' : 'Introduction declined');
    },
    [showToast]
  );

  const requestIntro = useCallback(
    (personId: string, reason: string) => {
      const person = getPerson(personId);
      if (!person) return;
      const mutual = person.via || 'Mutual friend';
      const newIntro: IntroRequest = {
        id: `intro-${Date.now()}`,
        type: 'sent',
        fromName: 'You',
        toName: person.name,
        toId: personId,
        reason: reason || `I'd like an introduction to ${person.firstName}.`,
        mutual,
        status: 'pending',
      };
      setIntros((prev) => [newIntro, ...prev]);
      showToast(`Intro requested · waiting on ${mutual.split(' ')[0]}`);
    },
    [showToast]
  );

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const toggleNotificationSetting = useCallback((key: keyof NotificationSettings) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const togglePrivacy = useCallback((key: keyof PrivacySettings) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const addConnection = useCallback(
    (personId: string) => {
      setRecentConnections((prev) =>
        prev.includes(personId) ? prev : [personId, ...prev]
      );
      showToast('Connected — mutual consent confirmed');
    },
    [showToast]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const pendingIntroCount = useMemo(
    () => intros.filter((i) => i.type === 'received' && i.status === 'pending').length,
    [intros]
  );

  const value = useMemo(
    () => ({
      onboardingReady,
      hasSignedUp,
      hasCompletedHowTo,
      account,
      completeSignup,
      completeHowTo,
      enterFromLanding,
      updateAccount,
      profile,
      updateProfile,
      saved,
      rememberPerson,
      removeSaved,
      moveSaved,
      isSaved,
      intros,
      pendingIntroCount,
      respondIntro,
      requestIntro,
      notifications,
      markNotificationsRead,
      unreadCount,
      notificationSettings,
      toggleNotificationSetting,
      privacy,
      togglePrivacy,
      recentConnections,
      addConnection,
      toast,
      showToast,
      clearToast,
    }),
    [
      onboardingReady,
      hasSignedUp,
      hasCompletedHowTo,
      account,
      completeSignup,
      completeHowTo,
      enterFromLanding,
      updateAccount,
      profile,
      updateProfile,
      saved,
      rememberPerson,
      removeSaved,
      moveSaved,
      isSaved,
      intros,
      pendingIntroCount,
      respondIntro,
      requestIntro,
      notifications,
      markNotificationsRead,
      unreadCount,
      notificationSettings,
      toggleNotificationSetting,
      privacy,
      togglePrivacy,
      recentConnections,
      addConnection,
      toast,
      showToast,
      clearToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export type { Person };
