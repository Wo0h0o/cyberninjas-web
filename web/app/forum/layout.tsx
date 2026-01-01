import type { Metadata } from 'next'
import styles from './Forum.module.css'

export const metadata: Metadata = {
    title: 'Форум | CyberNinjas',
    description: 'Дискусии, въпроси и споделяне на знания за AI и автоматизация. Присъедини се към общността на CyberNinjas.',
    openGraph: {
        title: 'Форум | CyberNinjas',
        description: 'Дискусии, въпроси и споделяне на знания за AI и автоматизация.',
        type: 'website',
    }
}

export default function ForumLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={styles.forumLayoutWrapper}>
            {children}
        </div>
    )
}
