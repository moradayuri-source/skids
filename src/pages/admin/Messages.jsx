import { useState, useEffect } from 'react';
import { IoMailOutline, IoMailOpenOutline, IoTrashOutline, IoPaperPlaneOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonList } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const displayMessage = (message) => ({
  ...message,
  sender: message.senderName || 'Youth member',
  date: message.createdAt ? new Date(message.createdAt).toLocaleString() : '',
});

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    let active = true;
    api.admin
      .getMessages()
      .then((response) => {
        if (active) setMessages(response.data.map(displayMessage));
      })
      .catch((loadError) => {
        if (active) setError(loadError.response?.data?.message || 'Unable to load messages.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    if (message.status !== 'unread') return;
    try {
      const response = await api.admin.markMessageRead(message.id);
      const updated = displayMessage(response.data);
      setMessages((current) => current.map((item) => item.id === message.id ? updated : item));
      setSelectedMessage(updated);
    } catch (readError) {
      setError(readError.response?.data?.message || 'Unable to mark message as read.');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const response = await api.admin.replyMessage(selectedMessage.id, { reply: replyText });
      const updated = displayMessage(response.data);
      setMessages((current) => current.map((item) => item.id === updated.id ? updated : item));
      setReplyText('');
      setIsModalOpen(false);
    } catch (replyError) {
      setError(replyError.response?.data?.message || 'Unable to send reply.');
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await api.admin.deleteMessage(id);
        setMessages((current) => current.filter((message) => message.id !== id));
      } catch (deleteError) {
        setError(deleteError.response?.data?.message || 'Unable to delete message.');
      }
    }
  };

  const getStatusIcon = (status) => {
    return status === 'unread' ? 
      <IoMailOutline className="w-5 h-5 text-primary-500" /> : 
      <IoMailOpenOutline className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">View and respond to youth messages, suggestions, and concerns.</p>
      </div>

      <Card className="p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {loading ? (
          <SkeletonList rows={4} />
        ) : (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No messages received.</p>
            ) : (
              messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                  message.status === 'unread' ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200'
                }`}
                onClick={() => handleViewMessage(message)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(message.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                      {message.sender}
                    </p>
                    <p className="text-xs text-gray-400">{message.date}</p>
                  </div>
                  <p className={`text-sm ${message.status === 'unread' ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {message.subject}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{message.message}</p>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(message.id);
                    }}
                  >
                    <IoTrashOutline className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* View/Reply Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Message Details"
        size="lg"
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedMessage.sender}</p>
                <p className="text-sm text-gray-500">{selectedMessage.subject}</p>
                <p className="text-xs text-gray-400">{selectedMessage.date}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedMessage.status === 'unread' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {selectedMessage.status}
              </span>
            </div>
            
            <div className="py-4">
              <p className="text-gray-700">{selectedMessage.message}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reply</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows="3"
                placeholder="Type your reply here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={handleReply} icon={IoPaperPlaneOutline} disabled={replying}>
                {replying ? 'Sending…' : 'Send Reply'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Messages;
