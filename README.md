# STV CMS - Next.js Content Management System

A modern, performant CMS built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

### Performance Optimizations
- ✅ **React Query** for efficient data fetching and caching
- ✅ **Next/Image** for optimized image loading
- ✅ **Suspense boundaries** for better loading states
- ✅ **Error boundaries** for graceful error handling
- ✅ **Code splitting** and lazy loading
- ✅ **Production-safe logging** (auto-strips in production)

### Type Safety
- ✅ **TypeScript** strict mode enabled
- ✅ **Zod validators** for all API payloads
- ✅ **Type-safe API client** with proper error handling
- ✅ **ESLint rules** enforcing best practices

### Developer Experience
- ✅ **Custom hooks** for all data operations
- ✅ **Centralized configuration** management
- ✅ **Environment validation** at startup
- ✅ **React Query Devtools** for debugging
- ✅ **Comprehensive error handling**

### UI/UX
- ✅ **Loading skeletons** for all async data
- ✅ **Toast notifications** (ready to implement)
- ✅ **Responsive design** with Tailwind CSS
- ✅ **Dark/B&W themes** with proper CSS variables
- ✅ **Accessible components** (Radix UI)

## 📁 Project Structure

```
stv-cms-nextjs/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Dashboard page
│   └── post/                # Post-related routes
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── providers/      # Context providers
│   │   ├── error-boundary.tsx
│   │   ├── loading-skeletons.tsx
│   │   └── cms-image.tsx
│   ├── config/             # App configuration
│   │   └── index.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── use-posts.ts
│   │   ├── use-post-queries.ts
│   │   ├── use-image-upload.ts
│   │   └── use-utils.ts
│   ├── lib/                # Utilities and API
│   │   ├── api.ts
│   │   ├── api-errors.ts
│   │   ├── logger.ts
│   │   ├── env.ts
│   │   ├── query-keys.ts
│   │   └── utils.ts
│   ├── types/              # TypeScript definitions
│   │   └── post.ts
│   └── validators/         # Zod schemas
│       └── post.ts
└── public/                 # Static assets
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on port 8080 (or configure in `.env`)

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
npm start
```

## 📝 Usage

### Fetching Posts

**Server Component (Recommended for initial load)**
```tsx
import { getPosts } from '@/lib/api';

export default async function PostsPage() {
  const posts = await getPosts();
  return <PostsList posts={posts} />;
}
```

**Client Component (with React Query)**
```tsx
'use client';
import { usePosts } from '@/hooks/use-post-queries';
import { PostCardSkeleton } from '@/components/loading-skeletons';

export default function PostsPage() {
  const { data: posts, isLoading, error } = usePosts();
  
  if (isLoading) return <PostCardSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <PostsList posts={posts} />;
}
```

### Creating a Post

```tsx
'use client';
import { useCreatePost } from '@/hooks/use-post-queries';
import { useRouter } from 'next/navigation';

export default function CreatePostForm() {
  const mutation = useCreatePost();
  const router = useRouter();

  const handleSubmit = async (data: FormData) => {
    try {
      await mutation.mutateAsync({
        title: data.get('title') as string,
        user_id: 'user123',
        content_blocks: [...],
      });
      router.push('/');
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Image Upload

```tsx
'use client';
import { useImageUpload } from '@/hooks/use-image-upload';
import { CMSImage } from '@/components/cms-image';

export default function ImageUploader() {
  const { upload, loading, previewUrl, filename } = useImageUpload();

  return (
    <div>
      <input type="file" onChange={(e) => upload(e.target.files[0])} />
      {loading && <p>Uploading...</p>}
      {previewUrl && <img src={previewUrl} alt="Preview" />}
      {filename && <CMSImage src={filename} alt="Uploaded" width={400} height={300} />}
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | Backend API URL (server-side) | `http://localhost:8080` |
| `NEXT_PUBLIC_IMAGE_URL` | Image base URL | `http://localhost:8080` |
| `API_TIMEOUT` | Request timeout (ms) | `10000` |
| `API_RETRY_ATTEMPTS` | Retry attempts | `3` |
| `NEXT_PUBLIC_APP_NAME` | App name | `STV CMS` |
| `DEBUG` | Enable debug logging | `false` |

### Tailwind Configuration

Edit `tailwind.config.ts` to customize:
- Colors and design tokens
- Breakpoints
- Animations
- Component variants

## 🎨 Theming

The app supports multiple themes via CSS variables:

- **Dark** (default): Modern dark theme
- **B&W**: Black and white minimal theme

Switch themes using the theme provider or UI toggle.

## 📊 Performance Tips

1. **Use Server Components** for initial data fetching
2. **Use React Query hooks** for client-side interactions
3. **Enable image optimization** with `CMSImage` component
4. **Implement route prefetching** with `Link` component
5. **Use Suspense boundaries** for better loading UX

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build
npm run build
```

## 📚 Best Practices

### DO ✅
- Use Server Components for data fetching
- Use React Query for client-side mutations
- Implement loading skeletons
- Handle errors with ErrorBoundary
- Use TypeScript strictly
- Validate inputs with Zod

### DON'T ❌
- Don't use `console.log` (use `logger`)
- Don't skip error handling
- Don't use `any` type
- Don't hardcode URLs
- Don't ignore loading states
- Don't bypass TypeScript

## 🚨 Error Handling

All API errors are properly typed:

```tsx
import { isApiError, getErrorMessage } from '@/lib/api-errors';

try {
  await createPost(data);
} catch (error) {
  if (isApiError(error)) {
    // Handle API-specific errors
    console.error('API Error:', error.message, error.status);
  } else {
    // Handle other errors
    console.error('Unexpected error:', getErrorMessage(error));
  }
}
```

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript strictly
3. Add proper error handling
4. Update documentation
5. Test before committing

## 📄 License

MIT License

## 🎯 Roadmap

- [ ] Add unit tests
- [ ] Implement form validation with react-hook-form
- [ ] Add optimistic updates
- [ ] Implement search with debounce
- [ ] Add pagination component
- [ ] Implement drag-and-drop for images
- [ ] Add keyboard shortcuts
- [ ] Improve accessibility (ARIA labels)
- [ ] Add analytics tracking
- [ ] Implement PWA features

---

Built with ❤️ using Next.js 15, TypeScript, and Tailwind CSS
