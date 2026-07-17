import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/button/Button';
import routes from '../../config/routes';
import homeImage from '../../assests/images/home_page_image.png';
import styles from './LandingPage.module.scss';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}  style={{ backgroundImage: `url(${homeImage})` }}>
      <div className={styles.content}>
        <h1 className={styles.title}>TaskFlow</h1>

        <p className={styles.subtitle}>
          Keep your organization aligned and moving forward.
        </p>

        <p className={styles.description}>
          TaskFlow helps founders, admins, and team members collaborate in shared
          spaces for planning, approvals, and execution across every organization
          they belong to.
        </p>

        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={() => navigate(routes.signup.path)}
          >
            Create account
          </Button>

          <Button
            variant="white"
            onClick={() => navigate(routes.login.path)}
          >
            Sign in
          </Button>
        </div>
      </div>

      <div className={styles.rightSide} />
    </div>
  );
}