import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subtopicsService, resourcesService } from '../services/api';

function ResourcesPage() {
    const { subtopicId } = useParams();
    const navigate = useNavigate();
    const [subtopic, setSubtopic] = useState(null);
    const [resources, setResources] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState('');
    const [resourceType, setResourceType] = useState('url');
    const [newResource, setNewResource] = useState({
        title: '',
        url: '',
        tag: '',
        file: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubtopicInfo();
        fetchResources();
        fetchTags();
    }, [subtopicId]);

    const fetchSubtopicInfo = async () => {
        try {
            const topicsResponse = await subtopicsService.getSubtopics(subtopicId);
            if (topicsResponse.data.length > 0) {
                setSubtopic(topicsResponse.data[0]);
            } else {
                const subtopicsResponse = await resourcesService.getResources(subtopicId);
                if (subtopicsResponse.data.length > 0) {
                    setSubtopic({ name: 'Resources' });
                } else {
                    setError('Subtopic not found');
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await resourcesService.getResources(subtopicId, selectedTag);
            setResources(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load resources. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await resourcesService.getTags();
            setTags(['', ...response.data]);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchResources();
    }, [selectedTag]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewResource(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setNewResource(prev => ({ ...prev, file: e.target.files[0] }));
    };

    const handleCreateResource = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            let response;

            if (resourceType === 'url') {
                response = await resourcesService.createResource(subtopicId, {
                    title: newResource.title,
                    url: newResource.url,
                    tag: newResource.tag
                });
            } else {
                const formData = new FormData();
                formData.append('title', newResource.title);
                formData.append('tag', newResource.tag);
                formData.append('file', newResource.file);

                response = await resourcesService.uploadResource(subtopicId, formData);
            }

            setResources([...resources, response.data]);
            setNewResource({ title: '', url: '', tag: '', file: null });
            setResourceType('url');

            if (!tags.includes(response.data.tag)) {
                setTags([...tags, response.data.tag]);
            }
        } catch (err) {
            setError('Failed to create resource. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResource = async (resourceId) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;

        try {
            await resourcesService.deleteResource(subtopicId, resourceId);
            setResources(resources.filter(resource => resource._id !== resourceId));
        } catch (err) {
            setError('Failed to delete resource. Please try again.');
            console.error(err);
        }
    };

    const renderResourceLink = (resource) => {
        if (resource.file_type) {
            if (resource.file_type.includes('image')) {
                return <a href={resource.url} className="text-blue-600 hover:underline text-sm" target="_blank" rel="noreferrer">View Image</a>;
            } else if (resource.file_type.includes('pdf')) {
                return <a href={resource.url} className="text-blue-600 hover:underline text-sm" target="_blank" rel="noreferrer">View PDF</a>;
            } else {
                return <a href={resource.url} className="text-blue-600 hover:underline text-sm" target="_blank" rel="noreferrer">Download File</a>;
            }
        }
        return <a href={resource.url} className="text-blue-600 hover:underline text-sm break-all" target="_blank" rel="noreferrer">{resource.url}</a>;
    };

    const pastelColors = ['bg-pink-100', 'bg-yellow-100', 'bg-green-100', 'bg-blue-100', 'bg-purple-100'];

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">← Back</button>

            <h1 className="text-3xl font-bold text-center">{subtopic ? subtopic.name : 'Loading...'}</h1>
            <p className="text-center text-gray-500 mb-6">Resources</p>

            {error && <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">{error}</div>}

            {/* Add Resource Form */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-10">
                <h2 className="text-2xl font-semibold mb-4">Add New Resource</h2>

                <form onSubmit={handleCreateResource} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <label><input type="radio" value="url" checked={resourceType === 'url'} onChange={() => setResourceType('url')} className="mr-1" /> URL</label>
                        <label><input type="radio" value="file" checked={resourceType === 'file'} onChange={() => setResourceType('file')} className="mr-1" /> File</label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" name="title" placeholder="Title" value={newResource.title} onChange={handleInputChange} required className="input input-bordered w-full" />
                        <input type="text" name="tag" placeholder="Tag (e.g., article, video)" value={newResource.tag} onChange={handleInputChange} required className="input input-bordered w-full" />
                    </div>

                    {resourceType === 'url' ? (
                        <input type="text" name="url" placeholder="https://example.com" value={newResource.url} onChange={handleInputChange} className="input input-bordered w-full" />
                    ) : (
                        <input type="file" name="file" onChange={handleFileChange} className="input input-bordered w-full" />
                    )}

                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Resource'}
                    </button>
                </form>
            </div>

            {/* Tag Filter */}
            <div className="mb-6">
                <label className="block mb-1 text-gray-700">Filter by Tag</label>
                <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="input input-bordered w-full">
                    <option value="">All</option>
                    {tags.filter(tag => tag !== '').map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading resources...</p>
                </div>
            )}

            {/* No resources */}
            {!loading && resources.length === 0 && (
                <p className="text-center text-gray-500">No resources found. Try adding some!</p>
            )}

            {/* Resource List */}
            <div className="space-y-4">
                {resources.map((resource, index) => (
                    <div key={resource._id} className={`p-4 rounded-lg shadow ${pastelColors[index % pastelColors.length]} flex justify-between items-start`}>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{resource.title}</h3>
                            <div className="text-sm mt-1">{renderResourceLink(resource)}</div>
                            <span className="inline-block mt-2 bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">{resource.tag}</span>
                        </div>
                        <button onClick={() => handleDeleteResource(resource._id)} className="text-red-600 hover:underline text-sm">Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ResourcesPage;
