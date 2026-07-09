import { useState, useEffect } from 'react';
import { IoPaperPlaneOutline, IoChatbubbleOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonList } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const displayMessage = (message) => ({
  ...message,
  date: message.createdAt ? new Date(message.createdAt).toLocaleString() : '',
});

const UserMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    let active = true;
    api.user
      .getMessages()
      .then((response) => {
        if (active) setMessages(response.data.map(displayMessage));
      })
      .catch((loadError) => {
        if (active) setError(loadError.response?.data?.message || 'Unable to load message history.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSend = async () => {
    const subject = formData.subject.trim();
    const message = formData.message.trim();
    if (!subject || !message) {
      setError('Subject and message are required.');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.user.sendMessage({ subject, message });
      setMessages((current) => [displayMessage(response.data), ...current]);
      setIsModalOpen(false);
      setFormData({ subject: '', message: '' });
      setSuccess('Your message was sent to the SK office.');
    } catch (sendError) {
      setError(sendError.response?.data?.message || 'Unable to send your message.');
    } finally {
      setSending(false);
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

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

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
            {messages.map((message) => {
              const latestReply = message.replies?.at(-1);
              return (
                <div key={message.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{message.subject}</p>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          message.status === 'unread'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {message.status === 'unread' ? 'Sent' : 'Read by SK'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{message.message}</p>
                      <span className="mt-2 block text-xs text-slate-400">Sent: {message.date}</span>
                      {latestReply && (
                        <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50 p-3">
                          <p className="text-xs font-semibold text-primary-700">
                            Reply from {latestReply.senderName || 'SK Office'}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">{latestReply.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={sending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSend} icon={IoPaperPlaneOutline} disabled={sending}>
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserMessages;
