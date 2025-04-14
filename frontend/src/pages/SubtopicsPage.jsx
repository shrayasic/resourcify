import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { topicsService, subtopicsService } from '../services/api';

function SubtopicsPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newSubtopic, setNewSubtopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTopicInfo();
    fetchSubtopics();
  }, [topicId]);

  const fetchTopicInfo = async () => {
    try {
      const response = await topicsService.getAllTopics();
      const currentTopic = response.data.find(t => t._id === topicId);
      if (!currentTopic) {
        setError('Topic not found');
        return;
      }
      setTopic(currentTopic);
    } catch (err) {
      setError('Failed to load topic information.');
      console.error(err);
    }
  };

  const fetchSubtopics = async () => {
    try {
      setLoading(true);
      const response = await subtopicsService.getSubtopics(topicId);
      setSubtopics(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load subtopics. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim() === '') {
        await fetchSubtopics();
        return;
      }
      const response = await subtopicsService.searchSubtopics(topicId, searchQuery);
      setSubtopics(response.data);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubtopic = async (e) => {
    e.preventDefault();
    if (!newSubtopic.trim()) return;
    try {
      const response = await subtopicsService.createSubtopic(topicId, { name: newSubtopic });
      setSubtopics([...subtopics, response.data]);
      setNewSubtopic('');
    } catch (err) {
      setError('Failed to create subtopic. Please try again.');
      console.error(err);
    }
  };

  const handleDeleteSubtopic = async (subtopicId) => {
    if (!window.confirm('Are you sure you want to delete this subtopic?')) return;
    try {
      await subtopicsService.deleteSubtopic(topicId, subtopicId);
      setSubtopics(subtopics.filter((subtopic) => subtopic._id !== subtopicId));
    } catch (err) {
      setError('Failed to delete subtopic. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="text-blue-600 hover:underline flex items-center"
        >
          ← Back to Topics
        </button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-1">
        {topic ? topic.name : 'Loading...'}
      </h1>
      <p className="text-center text-gray-500 mb-8">Explore and manage subtopics</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Create */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="md:w-2/3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search subtopics..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className="absolute right-2 top-1.5 text-gray-500 hover:text-blue-500"
              onClick={handleSearch}
            >
              🔍
            </button>
          </div>
        </div>

        <form onSubmit={handleCreateSubtopic} className="md:w-1/3 flex">
          <input
            type="text"
            placeholder="New subtopic name"
            className="w-full px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newSubtopic}
            onChange={(e) => setNewSubtopic(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition"
          >
            Add
          </button>
        </form>
      </div>

      {/* Subtopics List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">Loading subtopics...</p>
        </div>
      ) : subtopics.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No subtopics found. Add your first one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subtopics.map((subtopic, index) => (
            <div
              key={subtopic._id}
              className={`rounded-xl p-5 shadow-sm border hover:shadow-md transition cursor-pointer ${
                index % 5 === 0
                  ? 'bg-[#E9F6FF]'
                  : index % 5 === 1
                  ? 'bg-[#F9F0FF]'
                  : index % 5 === 2
                  ? 'bg-[#FFF7E6]'
                  : index % 5 === 3
                  ? 'bg-[#F0FFF4]'
                  : 'bg-[#F5F5F5]'
              }`}
            >
              <Link to={`/subtopics/${subtopic._id}`}>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{subtopic.name}</h3>
                <p className="text-gray-500 text-sm">Click to view resources</p>
              </Link>
              <button
                onClick={() => handleDeleteSubtopic(subtopic._id)}
                className="mt-4 text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubtopicsPage;
