import { useState, useEffect } from 'react';
import { IoMailOutline, IoMailOpenOutline, IoTrashOutline, IoPaperPlaneOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonList } from '../../components/common/Skeleton';
import { getMessages } from '../../utils/mockData';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Future API call: fetchMessages()
    // axios.get('/api/admin/messages')
    //   .then(response => setMessages(response.data))
    //   .catch(error => console.error('Error fetching messages:', error));

    const data = getMessages();
    setMessages(data);
    setLoading(false);
  }, []);

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    // Mark as read
    // Future API call: markAsRead(message.id)
    // axios.put(`/api/admin/messages/${message.id}/read`)
    //   .then(() => {
    //     setMessages(messages.map(m => 
    //       m.id === message.id ? { ...m, status: 'read' } : m
    //     ));
    //   })
    //   .catch(error => console.error('Error marking message as read:', error));

    setMessages((prev) => prev.map((m) => 
      m.id === message.id ? { ...m, status: 'read' } : m
    ));
  };

  const handleReply = () => {
    // Future API call: sendReply(selectedMessage.id, replyText)
    // axios.post(`/api/admin/messages/${selectedMessage.id}/reply`, { reply: replyText })
    //   .then(() => {
    //     setReplyText('');
    //     setIsModalOpen(false);
    //   })
    //   .catch(error => console.error('Error sending reply:', error));

    alert(`Reply sent to ${selectedMessage.sender}: ${replyText}`);
    setReplyText('');
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    // Future API call: deleteMessage(id)
    // axios.delete(`/api/admin/messages/${id}`)
    //   .then(() => {
    //     setMessages(messages.filter(m => m.id !== id));
    //   })
    //   .catch(error => console.error('Error deleting message:', error));

    if (window.confirm('Are you sure you want to delete this message?')) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
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
              <Button variant="primary" onClick={handleReply} icon={IoPaperPlaneOutline}>
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Messages;
