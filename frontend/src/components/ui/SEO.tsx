/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { useEffect } from 'react'

interface SEOProps {
    title?: string
    description?: string
    image?: string
    url?: string
    type?: 'website' | 'article'
}

const DEFAULT_TITLE = 'Interior Design AI - Transform Your Space'
const DEFAULT_DESCRIPTION = 'AI-powered interior design platform. Upload a room photo, choose a style, and watch AI transform your space instantly.'
const DEFAULT_IMAGE = '/og-image.png'

export function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url,
    type = 'website',
}: SEOProps) {
    const fullTitle = title ? `${title} | Interior Design AI` : DEFAULT_TITLE

    useEffect(() => {
        // Update document title
        document.title = fullTitle

        // Update or create meta tags
        const updateMeta = (name: string, content: string, property = false) => {
            const attr = property ? 'property' : 'name'
            let meta = document.querySelector(`meta[${attr}="${name}"]`)
            if (!meta) {
                meta = document.createElement('meta')
                meta.setAttribute(attr, name)
                document.head.appendChild(meta)
            }
            meta.setAttribute('content', content)
        }

        // Standard meta
        updateMeta('description', description)

        // Open Graph
        updateMeta('og:title', fullTitle, true)
        updateMeta('og:description', description, true)
        updateMeta('og:type', type, true)
        updateMeta('og:image', image, true)
        if (url) updateMeta('og:url', url, true)

        // Twitter Card
        updateMeta('twitter:card', 'summary_large_image')
        updateMeta('twitter:title', fullTitle)
        updateMeta('twitter:description', description)
        updateMeta('twitter:image', image)

    }, [fullTitle, description, image, url, type])

    return null
}

// Page-specific SEO configurations
export const PAGE_SEO = {
    home: {
        title: undefined, // Uses default
        description: 'AI-powered interior design platform. Transform any room with one click.',
    },
    transform: {
        title: 'Transform Room',
        description: 'Upload a photo of your room and transform it with AI-powered design styles.',
    },
    gallery: {
        title: 'Design Gallery',
        description: 'Explore thousands of AI-generated interior designs for inspiration.',
    },
    budget: {
        title: 'Budget Planner',
        description: 'Plan your interior design budget with AI-powered cost estimates.',
    },
    ar: {
        title: '3D & AR View',
        description: 'Visualize your designs in 3D and augmented reality.',
    },
    learn: {
        title: 'Learn Design',
        description: 'Learn interior design principles from our AI education assistant.',
    },
    profile: {
        title: 'Profile',
        description: 'View your design portfolio and preferences.',
    },
    history: {
        title: 'Design History',
        description: 'Browse and manage your design transformation history.',
    },
}

export default SEO
