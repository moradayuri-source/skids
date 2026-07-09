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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Send suggestions, concerns, or inquiries to SK officials.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={IoPaperPlaneOutline}>
          New Message
        </Button>
      </div>

      <Card className="min-h-[420px] p-5 sm:p-6">
        {loading ? (
          <SkeletonList rows={3} />
        ) : messages.length === 0 ? (
          <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-slate-100 p-4 ring-8 ring-slate-50">
                <IoChatbubbleOutline className="h-12 w-12 text-slate-300" />
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="5"
              placeholder="Type your message, suggestion, or concern here..."
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
              required
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
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
