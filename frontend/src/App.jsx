import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    addDoc, 
    serverTimestamp, 
    query, 
    limit, 
    orderBy,
    setLogLevel
} from 'firebase/firestore';

// --- Global Firebase Variables (Provided by Canvas Environment) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
// setLogLevel('debug'); // Uncomment to enable Firestore debugging logs

// Helper function for text formatting
const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
};

// --- Custom Components ---

const Header = ({ navigate, currentUserId }) => (
    <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 
                className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => navigate('home')}
            >
                UGC Blog Central
            </h1>
            <nav className="flex space-x-4 items-center">
                <button
                    onClick={() => navigate('home')}
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    All Posts
                </button>
                <button
                    onClick={() => navigate('create')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
                >
                    + New Post
                </button>
            </nav>
            {currentUserId && (
                <div className="hidden md:block text-xs text-gray-500 bg-gray-100 p-2 rounded-lg truncate max-w-xs">
                    User ID: <span className="font-mono text-gray-700">{truncateText(currentUserId, 15)}</span>
                </div>
            )}
        </div>
    </header>
);

const PostCard = ({ post }) => {
    const timeAgo = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
    
    // Determine the color based on the first letter of the authorId for simple distinction
    const authorColor = `hsl(${(post.authorId.charCodeAt(0) * 10) % 360}, 70%, 50%)`;

    return (
        <article className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl+ transition-shadow border border-gray-100 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h2>
            <div className="flex items-center text-sm text-gray-500 mb-4">
                <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: authorColor }} 
                    title={`Author: ${post.authorId}`}
                />
                <span className='truncate'>{truncateText(post.authorId, 15)}</span> 
                <span className="mx-2">•</span> 
                <span>{timeAgo}</span>
            </div>
            <p className="text-gray-600 flex-grow">{truncateText(post.content, 180)}</p>
            <button className="mt-4 text-indigo-600 font-medium hover:text-indigo-800 self-start transition-colors">
                Read More
            </button>
        </article>
    );
};

const HomeView = ({ posts, isLoading }) => {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 border-b-2 border-indigo-500 pb-2">
                Latest Community Posts
            </h2>
            
            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="ml-3 text-lg text-gray-600">Loading posts...</p>
                </div>
            )}

            {!isLoading && posts.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <p className="text-xl text-gray-500">No posts found yet.</p>
                    <p className="text-indigo-600 mt-2 font-medium">Be the first to create one!</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </main>
    );
};

const CreatePostView = ({ db, userId, navigate }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content || !userId) {
            setIsError(true);
            setMessage('Title and Content are required, and you must be logged in.');
            return;
        }

        setIsSubmitting(true);
        setIsError(false);
        setMessage('');

        try {
            const publicDataPath = `artifacts/${appId}/public/data/posts`;
            
            await addDoc(collection(db, publicDataPath), {
                title,
                content,
                authorId: userId,
                createdAt: serverTimestamp(),
            });

            setMessage('Post submitted successfully! Redirecting to home...');
            setTimeout(() => {
                setTitle('');
                setContent('');
                navigate('home');
            }, 1500);

        } catch (error) {
            console.error("Error adding document: ", error);
            setIsError(true);
            setMessage(`Failed to submit post: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
                Submit Your Article
            </h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl border border-indigo-100">
                <div className="mb-6">
                    <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
                        Article Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-lg"
                        placeholder="A catchy title for your post"
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div className="mb-8">
                    <label htmlFor="content" className="block text-lg font-medium text-gray-700 mb-2">
                        Content
                    </label>
                    <textarea
                        id="content"
                        rows="10"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-shadow text-base"
                        placeholder="Write your amazing article here..."
                        required
                        disabled={isSubmitting}
                    ></textarea>
                </div>
                
                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-md text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:scale-[1.01] disabled:opacity-50"
                    disabled={isSubmitting || !userId}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </>
                    ) : (
                        'Publish Post'
                    )}
                </button>
                {!userId && (
                    <p className="mt-4 text-sm text-center text-red-500">
                        Authentication is pending. Cannot publish until User ID is available.
                    </p>
                )}
            </form>
        </main>
    );
};

// --- Main Application Component ---

const App = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [posts, setPosts] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);

    const navigate = useCallback((page) => setCurrentPage(page), []);

    // 1. Firebase Initialization and Authentication
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);

            setDb(dbInstance);
            setAuth(authInstance);

            // Authentication listener
            const unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else {
                    // Sign in if not authenticated
                    try {
                        if (initialAuthToken) {
                            await signInWithCustomToken(authInstance, initialAuthToken);
                        } else {
                            await signInAnonymously(authInstance);
                        }
                    } catch (error) {
                        console.error("Firebase Auth Error:", error);
                        setUserId(crypto.randomUUID()); // Fallback to random ID if auth fails
                        setIsAuthReady(true);
                    }
                }
            });

            return () => {
                unsubscribeAuth();
            };

        } catch (error) {
            console.error("Firebase Initialization Failed:", error);
            setIsAuthReady(true);
            setUserId(crypto.randomUUID());
        }
    }, []);

    // 2. Firestore Data Listener
    useEffect(() => {
        if (!isAuthReady || !db) return;

        setIsLoadingPosts(true);

        const publicDataPath = `artifacts/${appId}/public/data/posts`;
        const postsRef = collection(db, publicDataPath);
        
        // Query to get the latest 50 posts, ordered by creation time
        const q = query(postsRef, orderBy('createdAt', 'desc'));

        // Listen for real-time changes
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(fetchedPosts);
            setIsLoadingPosts(false);
        }, (error) => {
            console.error("Firestore Snapshot Error:", error);
            setIsLoadingPosts(false);
        });

        // Cleanup function
        return () => unsubscribe();
    }, [isAuthReady, db]);

    // --- Render Logic ---
    let content;

    switch (currentPage) {
        case 'create':
            if (db && userId) {
                content = <CreatePostView db={db} userId={userId} navigate={navigate} />;
            } else {
                content = <div className="text-center py-20 text-xl text-gray-500">Waiting for authentication to create a post...</div>
            }
            break;
        case 'home':
        default:
            content = <HomeView posts={posts} isLoading={isLoadingPosts || !isAuthReady} />;
            break;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            
            <Header navigate={navigate} currentUserId={userId} />
            {content}

            <footer className="py-6 mt-10 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>UGC Blog Platform | User ID: {userId ? truncateText(userId, 20) : 'Authenticating...'}</p>
                <p>Data stored publicly in Firestore collection: <span className="font-mono text-xs">artifacts/{appId}/public/data/posts</span></p>
            </footer>
        </div>
    );
};

export default App;