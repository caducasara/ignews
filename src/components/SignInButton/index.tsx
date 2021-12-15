import styles from './styles.module.scss'
import { signIn, signOut, useSession } from 'next-auth/client'

import { FaGithub } from 'react-icons/fa'
import { FiX } from 'react-icons/fi'

export function SignInButton() {

  const [session] = useSession();

  return session ? (
    <button
      type="button"
      className={styles.signinButton}
    >
      <FaGithub color="#04d361" />
      {session.user.name}
      <FiX color="#737380" className={styles.closeIcon} onClick={() => signOut()} />
    </button>
  ) : (
    <button
      type="button"
      className={styles.signinButton}
      onClick={() => signIn('github')}
    >
      <FaGithub color="#eba417" />
      Sign In with Github
    </button>
  )
}