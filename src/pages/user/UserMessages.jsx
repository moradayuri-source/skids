import { useState, useEffect } from 'react';
import { IoPaperPlaneOutline, IoChatbubbleOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonList } from '../../components/common/Skeleton';

const UserMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSend = () => {
    // Future API call: sendMessage(formData)
    // axios.post('/api/messages', formData)
    //   .then(() => {
    //     setIsModalOpen(false);
    //     setFormData({ subject: '', message: '' });
    //     alert('Message sent successfully!');
    //   })
    //   .catch(error => console.error('Error sending message:', error));

    if (formData.subject && formData.message) {
      const newMessage = {
        id: messages.length + 1,
        ...formData,
        sender: 'You',
        date: new Date().toLocaleDateString(),
        status: 'sent'
      };
      setMessages([...messages, newMessage]);
      setIsModalOpen(false);
      setFormData({ subject: '', message: '' });
      alert('Message sent successfully!');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">Send suggestions, concerns, or inquiries to SK officials.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={IoPaperPlaneOutline}>
          New Message
        </Button>
      </div>

      <Card className="p-6">
        {loading ? (
          <SkeletonList rows={3} />
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <IoChatbubbleOutline className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <p className="text-gray-500">No messages sent yet.</p>
            <p className="text-sm text-gray-400 mt-1">Click "New Message" to send your first message.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{message.subject}</p>
                    <p className="text-sm text-gray-600">{message.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">Sent: {message.date}</span>
                      <span className="text-xs text-green-600">✓ Sent</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* New Message Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Send a Message"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Brief subject of your message"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="5"
              placeholder="Type your message, suggestion, or concern here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSend} icon={IoPaperPlaneOutline}>
            Send Message
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserMessages;
