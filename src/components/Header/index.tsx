import Link from 'next/link'

import styles from './styles.module.scss'

import { SignInButton } from '../SignInButton'
import { ActiveLink } from '../ActiveLink/index'

export function Header() {

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="images/logo.svg" alt="ig.News" />
        <nav>
          <ul>
            <ActiveLink activeClassName={styles.active} href="/">
              <a>Home</a>
            </ActiveLink>
            <ActiveLink activeClassName={styles.active} href="/posts">
              <a>Posts</a>
            </ActiveLink>
          </ul>
        </nav>
        <SignInButton />
      </div>
    </header>
  )
}