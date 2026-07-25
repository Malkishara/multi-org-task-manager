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
  organization: {
    path: '/organization',
    name: 'organization',
    protected: true,
  },
  organizations: {
    path: '/organization/organizations',
    name: 'Organizations',
    protected: true,
  },
  tasks: {
    path: '/organization/tasks',
    name: 'Tasks',
    protected: true,
  },
  settings: {
    path: '/organization/settings',
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
