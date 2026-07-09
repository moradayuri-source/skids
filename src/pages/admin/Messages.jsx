import { useState, useEffect } from 'react';
import {
  IoMailOutline,
  IoMailOpenOutline,
  IoPaperPlaneOutline,
  IoSearchOutline,
  IoTrashOutline,
} from 'react-icons/io5';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
  const unreadCount = messages.filter((message) => message.status === 'unread').length;
  const readCount = messages.length - unreadCount;
  const visibleMessages = messages.filter((message) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'unread' && message.status === 'unread') ||
      (statusFilter === 'read' && message.status !== 'unread');
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      `${message.sender} ${message.subject} ${message.message}`.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Feedback Box</h1>
        <p className="page-subtitle">Review feedback from youth members and track read status.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { key: 'all', label: 'Total', value: messages.length },
          { key: 'unread', label: 'Unread', value: unreadCount },
          { key: 'read', label: 'Read', value: readCount },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setStatusFilter(item.key)}
            className={`rounded-xl border bg-white p-4 text-center shadow-sm transition ${
              statusFilter === item.key
                ? 'border-primary-400 ring-2 ring-primary-100'
                : 'border-slate-200 hover:border-primary-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</span>
            <span className="mt-1 block text-2xl font-bold text-primary-600">{item.value}</span>
          </button>
        ))}
      </div>

      <Card className="p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IoSearchOutline className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by sender, subject, or message..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
            />
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1">
            {['all', 'unread', 'read'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`rounded-md px-3 py-2 text-xs font-semibold capitalize transition ${
                  statusFilter === filter ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <SkeletonList rows={4} />
        ) : (
          <div className="space-y-3">
            {visibleMessages.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">No messages found.</p>
            ) : (
              visibleMessages.map((message) => (
              <div
                key={message.id}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all duration-200 hover:shadow-sm ${
                  message.status === 'unread' ? 'border-primary-200 bg-primary-50/70' : 'border-slate-200 bg-white'
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
                    <p className="ml-3 text-right text-xs text-slate-400">{message.date}</p>
                  </div>
                  <p className={`text-sm ${message.status === 'unread' ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {message.subject}
                  </p>
                  <p className="truncate text-sm text-slate-500">{message.message}</p>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(message.id);
                    }}
                  >
                    <IoTrashOutline className="h-4 w-4 text-rose-500" />
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
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
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

            <div className="border-t border-slate-100 pt-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Reply</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows="3"
                placeholder="Type your reply here..."
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
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
