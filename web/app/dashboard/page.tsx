'use client'

import { SkillTree } from '@/components/skill-tree'
import '@/app/skill-tree.css'

export default function DashboardPage() {
    return (
        <div className="skill-tree-page">
            <SkillTree />
        </div>
    )
}
