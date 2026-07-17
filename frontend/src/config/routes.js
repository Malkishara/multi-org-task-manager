// Routes configuration file
// Centralized route definitions for the application

const routes = {
  landing: {
    path: '/',
    name: 'Landing',
    protected: false,
  },
  login: {
    path: '/auth/login',
    name: 'Login',
    protected: false,
  },
  signup: {
    path: '/auth/signup',
    name: 'Sign Up',
    protected: false,
  },
  dashboard: {
    path: '/dashboard',
    name: 'Dashboard',
    protected: true,
  },
  organizations: {
    path: '/dashboard/organizations',
    name: 'Organizations',
    protected: true,
  },
  tasks: {
    path: '/dashboard/tasks',
    name: 'Tasks',
    protected: true,
  },
  settings: {
    path: '/dashboard/settings',
    name: 'Settings',
    protected: true,
  },
  notFound: {
    path: '/not-found',
    name: 'Not Found',
    protected: false,
  },
};

export default routes;
