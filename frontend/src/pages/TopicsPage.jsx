import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { topicsService } from '../services/api';

function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await topicsService.getAllTopics();
      setTopics(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load topics. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim() === '') {
        await fetchTopics();
        return;
      }
      const response = await topicsService.searchTopics(searchQuery);
      setTopics(response.data);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    try {
      const response = await topicsService.createTopic({ name: newTopic });
      setTopics([...topics, response.data]);
      setNewTopic('');
    } catch (err) {
      setError('Failed to create topic. Please try again.');
      console.error(err);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;
    try {
      await topicsService.deleteTopic(topicId);
      setTopics(topics.filter((topic) => topic._id !== topicId));
    } catch (err) {
      setError('Failed to delete topic. Please try again.');
      console.error(err);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const generateRandomColor = () => {
    const pastelColors = ['#D4F1F4', '#E4F9F5', '#F6E6E6', '#E8EAF6', '#F4F1DE'];
    return pastelColors[Math.floor(Math.random() * pastelColors.length)];
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-[#e8fae4f1] text-gray-800'} min-h-screen`}>
      <div className="max-w-6xl mx-auto px-6 py-10 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-semibold">🌿 Your Topics</h1>
          <button
            onClick={toggleDarkMode}
            className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600  text-white transition"
          >
            {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Search & Create */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="md:w-2/3 relative">
            <input
              type="text"
              placeholder="🔍 Search topics..."
              className="w-full border border-gray-300 rounded-full py-2 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className="absolute right-4 top-2.5 text-lg"
              onClick={handleSearch}
            >
              🔍
            </button>
          </div>

          <form onSubmit={handleCreateTopic} className="md:w-1/3 flex gap-2">
            <input
              type="text"
              placeholder="✨ New topic..."
              className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-200"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-green-200 hover:bg-green-300 text-green-900 font-medium px-4 py-2 rounded-full transition"
            >
              Add 🌈
            </button>
          </form>
        </div>

        {/* Topics Display */}
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <p className="mt-2 text-gray-500">Loading topics...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No topics found. Start with a new one above! ✨
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <div
                key={topic._id}
                style={{ backgroundColor: generateRandomColor() }}
                className="p-6 rounded-xl shadow-sm hover:shadow-lg transition transform hover:scale-[1.01]"
              >
                <Link to={`/topics/${topic._id}`} className="block">
                  <h3 className="text-xl font-semibold mb-1">{topic.name} 🧠</h3>
                  <p className="text-sm text-gray-600">Tap to explore details</p>
                </Link>
                <button
                  onClick={() => handleDeleteTopic(topic._id)}
                  className="mt-4 text-sm px-4 py-1 bg-red-200 hover:bg-red-300 text-red-800 rounded-full transition"
                >
                  Delete 🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-16 text-center text-gray-400 text-sm">
          🍃 Click on a topic card to explore more.
        </footer>
      </div>
    </div>
  );
}

export default TopicsPage;
