import {
  CContainer,
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CButton,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CFormSelect,
} from '@coreui/react';
import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

const ChatPage = () => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientLanguage, setPatientLanguage] = useState<'Slovak' | 'English' | 'German' | 'Spanish'>('Slovak');

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const initializeConversation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/start-consultation/${encodeURIComponent(patientLanguage)}`
      );
      const { conversation: initialMessages } = res.data;
      setConversation(initialMessages || []);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      setConversation([]);
    } finally {
      setLoading(false);
    }
  }, [patientLanguage]);

  useEffect(() => {
    initializeConversation();
  }, [initializeConversation]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const updatedConversation: Message[] = [...conversation, { role: 'user', content: input }];

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/chat', {
        input,
        conversation: updatedConversation,
      });

      const { conversation: newConversation } = res.data;
      setConversation(newConversation || updatedConversation);
      setInput('');
    } catch (err) {
      console.error('Chat error:', err);
      // Keep the optimistic user message on failure
      setConversation(updatedConversation);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversation = conversation
    .filter((msg) => msg.role === 'assistant' || msg.role === 'user')
    .filter((msg, idx, arr) => {
      if (
        msg.role === 'user' &&
        idx > 0 &&
        arr[idx - 1].role === 'user' &&
        arr[idx - 1].content === msg.content
      ) {
        return false;
      }
      return true;
    });

  return (
    <>
      <style>
        {`
          .no-bullets {
            list-style-type: none !important;
            padding-left: 0 !important;
            margin: 0 !important;
          }
          .no-focus-border:focus {
            outline: none !important;
            box-shadow: none !important;
          }
        `}
      </style>

      <CContainer
        className="py-5 d-flex flex-column align-items-center"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100w',
        }}
      >
        <CCard
          style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: '#fff',
          }}
        >
          <CCardBody className="d-flex flex-column" style={{ height: '80vh' }}>
            <h2
              style={{
                fontWeight: '700',
                color: '#007bff',
                marginBottom: '1rem',
                textAlign: 'center',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              }}
            >
              MedBot Virtuálny Asistent
            </h2>

            {/* Language selector */}
            <div style={{ marginBottom: '1rem' }}>
              <CFormSelect
                value={patientLanguage}
                onChange={(e) => setPatientLanguage(e.target.value as any)}
                disabled={loading}
                aria-label="Select patient language"
              >
                <option value="Slovak">Slovak</option>
                <option value="English">English</option>
                <option value="German">German</option>
                <option value="Spanish">Spanish</option>
              </CFormSelect>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                borderRadius: '0',
                marginBottom: '1.5rem',
                fontSize: '1rem',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              }}
            >
              <CListGroup flush className="no-bullets" style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredConversation.map((msg, idx) => {
                  const isAssistant = msg.role === 'assistant';

                  return (
                    <CListGroupItem
                      key={idx}
                      color={isAssistant ? 'primary' : ''}
                      style={{
                        backgroundColor: isAssistant ? '#e7f1ff' : '#d1ffd6',
                        color: isAssistant ? '#084298' : '#155724',
                        fontWeight: '500',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        wordBreak: 'break-word',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        listStyleType: 'none',
                        alignSelf: isAssistant ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div style={{ textAlign: isAssistant ? 'right' : 'left' }}>
                        <strong>{isAssistant ? 'Asistent' : 'Vy'}:</strong>{' '}
                        {msg.content}
                      </div>
                      {loading && idx === filteredConversation.length - 1 && isAssistant && (
                        <CSpinner size="sm" color="primary" className="ms-2 align-self-center" />
                      )}
                    </CListGroupItem>
                  );
                })}
                <div ref={chatEndRef} />
              </CListGroup>
            </div>

            <CForm
              onSubmit={handleSubmit}
              className="w-100"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <CFormInput
                className="no-focus-border"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Napíšte svoju správu..."
                disabled={loading}
                required
                style={{
                  border: 'none',
                  borderBottom: '2px solid #007bff',
                  borderRadius: '0',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  boxShadow: 'none',
                  flexGrow: 1,
                  flexBasis: '0',
                  minWidth: '0',
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                }}
              />

              <CButton
                type="submit"
                color="primary"
                disabled={loading}
                style={{
                  border: 'none',
                  borderRadius: '0',
                  padding: '0.75rem 1.25rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" /> Odosielam...
                  </>
                ) : (
                  'Odoslať'
                )}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  );
};

export default ChatPage;
