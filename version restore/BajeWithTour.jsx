import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { TourProvider } from '@reactour/tour';
import './Baje.css';

const supabase = createClient(
  'https://lgurtucciqvwgjaphdqp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndXJ0dWNjaXF2d2dqYXBoZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MzgzNTAsImV4cCI6MjA0NTIxNDM1MH0.I1ajlHp5b4pGL-NQzzvcVdznoiyIvps49Ws5GZHSXzk'
);

function Baje() {
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const quizTimerRef = useRef(null);
  const questionTimerRef = useRef(null);
  const factTimerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [avatarImage, setAvatarImage] = useState(null);
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [isSubmitMenuOpen, setIsSubmitMenuOpen] = useState(false);
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [isFactsCardOpen, setIsFactsCardOpen] = useState(false);
  const [isQuizCardOpen, setIsQuizCardOpen] = useState(false);
  const [isQuestionCardOpen, setIsQuestionCardOpen] = useState(false);
  const [fact, setFact] = useState({ question: '', answer: '' });
  const [quiz, setQuiz] = useState({ question: '', options: [], correct_answer: '' });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState({ id: null, question: '' });
  const [userResponse, setUserResponse] = useState('');
  const [responseFeedback, setResponseFeedback] = useState('');
  const [activeAgent, setActiveAgent] = useState('Main');
  const [agentIcon, setAgentIcon] = useState('🤖');
  const [submitIcon, setSubmitIcon] = useState('📝');
  const [uploadError, setUploadError] = useState(null);
  const [notificationCount, setNotificationCount] = useState(4);
  const [userPromptCount, setUserPromptCount] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Barbados',
    nickname: 'Bajan',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Flag_of_Barbados.svg/1200px-Flag_of_Barbados.svg.png'
  });
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const FACT_INTERVAL = 180000; // 3 minutes
  const QUESTION_INTERVAL = 120000; // 2 minutes

  const caribbeanCountries = [
    { name: 'Antigua and Barbuda', nickname: 'Antiguan', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Flag_of_Antigua_and_Barbuda.svg/1200px-Flag_of_Antigua_and_Barbuda.svg.png' },
    { name: 'Bahamas', nickname: 'Bahamian', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Flag_of_the_Bahamas.svg/1200px-Flag_of_the_Bahamas.svg.png' },
    { name: 'Barbados', nickname: 'Bajan', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Flag_of_Barbados.svg/1200px-Flag_of_Barbados.svg.png' },
    { name: 'Belize', nickname: 'Belizean', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Flag_of_Belize.svg/1200px-Flag_of_Belize.svg.png' },
    { name: 'Dominica', nickname: 'Dominican', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Flag_of_Dominica.svg/1200px-Flag_of_Dominica.svg.png' },
    { name: 'Grenada', nickname: 'Grenadian', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Grenada.svg/1200px-Flag_of_Grenada.svg.png' },
    { name: 'Guyana', nickname: 'Guyanese', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Flag_of_Guyana.svg/1200px-Flag_of_Guyana.svg.png' },
    { name: 'Jamaica', nickname: 'Jamaican', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flag_of_Jamaica.svg/1200px-Flag_of_Jamaica.svg.png' },
    { name: 'Saint Kitts and Nevis', nickname: 'Kittitian or Nevisian', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Saint_Kitts_and_Nevis.svg/1200px-Flag_of_Saint_Kitts_and_Nevis.svg.png' },
    { name: 'Saint Lucia', nickname: 'Lucian', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Saint_Lucia.svg/1200px-Flag_of_Saint_Lucia.svg.png' },
    { name: 'Saint Vincent and the Grenadines', nickname: 'Vincentian', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Flag_of_Saint_Vincent_and_the_Grenadines.svg/1200px-Flag_of_Saint_Vincent_and_the_Grenadines.svg.png' },
    { name: 'Suriname', nickname: 'Surinamese', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Flag_of_Suriname.svg/1200px-Flag_of_Suriname.svg.png' },
    { name: 'Trinidad and Tobago', nickname: 'Trinbagonian', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Trinidad_and_Tobago.svg/1200px-Flag_of_Trinidad_and_Tobago.svg.png' }
  ];

  const defaultQuestion = {
    id: uuidv4(),
    question_text: 'What is your favorite cultural festival in Barbados?'
  };

  const insertDefaultQuestion = async () => {
    try {
      const { error } = await supabase
        .from('open_questions')
        .insert({ id: defaultQuestion.id, question_text: defaultQuestion.question_text });

      if (error) {
        console.error('Error inserting default question:', error.message, error.details);
        throw error;
      }
      console.log('Inserted default question:', defaultQuestion);
      return defaultQuestion;
    } catch (err) {
      console.error('insertDefault error:', err.message);
      throw err;
    }
  };

  useEffect(() => {
    const initializeTimer = (key, interval, callback) => {
      const startTime = localStorage.getItem(key);
      const now = Date.now();
      let delay;

      if (startTime) {
        const elapsed = now - parseInt(startTime, 10);
        const timeSinceLast = elapsed % interval;
        delay = timeSinceLast === 0 ? interval : interval - timeSinceLast;
      } else {
        localStorage.setItem(key, now.toString());
        delay = interval;
      }

      const timer = setTimeout(() => {
        callback();
        const intervalId = setInterval(callback, interval);
        return () => clearInterval(intervalId);
      }, delay);

      return () => clearTimeout(timer);
    };

    const factCleanup = initializeTimer('factTimerStart', FACT_INTERVAL, async () => {
      if (!isQuizCardOpen && !isQuestionCardOpen) {
        await fetchFact();
        setIsFactsCardOpen(true);
        setIsQuizCardOpen(false);
        setIsQuestionCardOpen(false);
        console.log('New fact fetched and card displayed after 3 minutes');
      } else {
        setTimeout(async () => {
          await fetchFact();
          setIsFactsCardOpen(true);
          setIsQuizCardOpen(false);
          setIsQuestionCardOpen(false);
          console.log('Delayed fact fetched and card displayed');
        }, 10000);
      }
    });

    const questionCleanup = initializeTimer('questionTimerStart', QUESTION_INTERVAL, async () => {
      if (!isFactsCardOpen && !isQuizCardOpen) {
        await fetchQuestion();
        setIsQuestionCardOpen(true);
        setIsFactsCardOpen(false);
        setIsQuizCardOpen(false);
        console.log('New question fetched and card displayed after 2 minutes');
      } else {
        setTimeout(async () => {
          await fetchQuestion();
          setIsQuestionCardOpen(true);
          setIsFactsCardOpen(false);
          setIsQuizCardOpen(false);
          console.log('Delayed question fetched and card displayed');
        }, 10000);
      }
    });

    return () => {
      factCleanup();
      questionCleanup();
    };
  }, [isFactsCardOpen, isQuizCardOpen, isQuestionCardOpen]);

  useEffect(() => {
    setMessages([
      {
        id: uuidv4(),
        role: 'assistant',
        content: `Welcome to ${selectedCountry.nickname}! I'm your ${selectedCountry.name} helper! Ask me about beaches, food, history, festivals, or take a quiz!`
      }
    ]);
    fetchFact().then(() => setIsFactsCardOpen(true));
    fetchQuiz();
    fetchQuestion().then(() => setIsQuestionCardOpen(false));
  }, [selectedCountry]);

  useEffect(() => {
    const userMessagesCount = messages.filter((msg) => msg.role === 'user').length;
    if (userMessagesCount > userPromptCount && userMessagesCount % 5 === 0) {
      if (!isFactsCardOpen && !isQuestionCardOpen) {
        fetchQuiz().then(() => {
          setIsQuizCardOpen(true);
          setIsFactsCardOpen(false);
          setIsQuestionCardOpen(false);
          console.log('Quiz fetched and displayed after 5 user prompts');
        });
      } else {
        setTimeout(() => {
          fetchQuiz().then(() => {
            setIsQuizCardOpen(true);
            setIsFactsCardOpen(false);
            setIsQuestionCardOpen(false);
            console.log('Delayed quiz fetched and displayed');
          });
        }, 10000);
      }
    }
    setUserPromptCount(userMessagesCount);
  }, [messages, userPromptCount, isFactsCardOpen, isQuestionCardOpen]);

  useEffect(() => {
    if (quizTimerRef.current) {
      clearTimeout(quizTimerRef.current);
    }
    return () => {
      if (quizTimerRef.current) {
        clearTimeout(quizTimerRef.current);
      }
    };
  }, [isQuizCardOpen]);

  useEffect(() => {
    setNotificationCount(4);
  }, []);

  const fallbackFacts = [
    { question: 'What is the capital of Barbados?', answer: 'Bridgetown' },
    { question: 'What sport is most popular in Barbados?', answer: 'Cricket' },
    { question: 'Who is a famous singer from Barbados?', answer: 'Rihanna' }
  ];

  const fallbackQuiz = {
    question: 'What is the national sport of Barbados?',
    options: ['Football', 'Cricket', 'Basketball', 'Tennis'],
    correct_answer: 'Cricket'
  };

  const fetchFact = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('sports')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error counting fact records:', countError.message);
        throw new Error('Fact count failed');
      }

      if (!count || count === 0) {
        const fallback = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
        setFact(fallback);
        return;
      }

      const randomOffset = Math.floor(Math.random() * count);
      const { data, error } = await supabase
        .from('sports')
        .select('questions, answers')
        .range(randomOffset, randomOffset);

      if (error || !data || !data.length) {
        throw error || new Error('No fact data received');
      }

      setFact({ question: data[0].questions, answer: data[0].answers });
    } catch (err) {
      console.error('fetchFact error:', err.message);
      const fallback = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
      setFact(fallback);
    }
  };

  const fetchQuiz = async () => {
    try {
      const { data, error } = await supabase.rpc('get_random_sportsq');

      if (error || !data || !data.length) {
        console.error('Quiz fetch error:', error?.message || 'No quiz data');
        throw error || new Error('No quiz data received');
      }

      const row = data[0];
      setQuiz({
        question: row.question,
        correct_answer: row.right_answer,
        options: shuffle([row.right_answer, row.wrong_answer1, row.wrong_answer2])
      });
    } catch (err) {
      console.error('fetchQuiz error:', err.message);
      setQuiz(fallbackQuiz);
    }
  };

  const fetchQuestion = async (retry = true) => {
    try {
      const { count, error: countError } = await supabase
        .from('open_questions')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error counting question records:', countError.message);
        throw new Error('Question count failed');
      }

      if (!count || count === 0) {
        console.log('No questions found, inserting default question...');
        await insertDefaultQuestion();
        const { data, error } = await supabase
          .from('open_questions')
          .select('id, question_text')
          .eq('id', defaultQuestion.id)
          .single();

        if (error || !data) {
          throw error || new Error('Failed to fetch default question');
        }

        setCurrentQuestion({ id: data.id, question: data.question_text });
        return;
      }

      const randomOffset = Math.floor(Math.random() * count);
      const { data, error } = await supabase
        .from('open_questions')
        .select('id, question_text')
        .range(randomOffset, randomOffset);

      if (error || !data || !data.length) {
        if (retry) return fetchQuestion(false);
        throw error || new Error('No question data received');
      }

      setCurrentQuestion({ id: data[0].id, question: data[0].question_text });
    } catch (err) {
      console.error('fetchQuestion error:', err.message);
      setCurrentQuestion({ id: null, question: 'Error loading question. Please try again.' });
    }
  };

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  const fetchSignedUrl = async (filePath, bucket = 'avatars') => {
    if (!filePath) return null;
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60);
    if (error) {
      console.error(`Error fetching signed URL from ${bucket} bucket:`, error);
      return null;
    }
    return data.signedUrl;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    async function checkSession() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        return;
      }
      if (session?.user) {
        const avatarUrl = session.user.user_metadata?.avatarUrl || null;
        if (avatarUrl) {
          const urlParts = avatarUrl.split('/');
          const fileName = urlParts[urlParts.length - 1].split('?')[0];
          const signedUrl = await fetchSignedUrl(fileName, 'avatars');
          if (signedUrl) setAvatarImage(signedUrl);
        }
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    const testConnections = async () => {
      try {
        const { data: questionData, error: questionError, count } = await supabase
          .from('open_questions')
          .select('id, question_text', { count: 'exact' });
        console.log('Open Questions Test Query Result:', { data: questionData, error: questionError, count });

        const { data: responseData, error: responseError } = await supabase
          .from('open_responses')
          .select('question_id, user_id, response_text', { count: 'exact' });
        console.log('Open Responses Test Query Result:', {
          data: responseData,
          error: responseError,
          details: responseError?.details,
          code: responseError?.code
        });

        const { data: notificationData, error: notificationError } = await supabase
          .from('notifications')
          .select('id, user_id, message, is_read', { count: 'exact' });
        console.log('Notifications Test Query Result:', {
          data: notificationData,
          error: notificationError,
          details: notificationError?.details,
          code: notificationError?.code
        });

        if (responseError?.code === 'PGRST116') {
          console.log('Attempting fallback to question_responses table...');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('question_responses')
            .select('question_id, user_id, response_text', { count: 'exact' });
          console.log('Question Responses Fallback Test Query Result:', {
            data: fallbackData,
            error: fallbackError,
            details: fallbackError?.details,
            code: fallbackError?.code
          });
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const testQuestionId = questionData?.[0]?.id || defaultQuestion.id;
          const testInsert = await supabase
            .from('open_responses')
            .insert({
              question_id: testQuestionId,
              user_id: session.user.id,
              response_text: 'Test response'
            })
            .select();
          console.log('Open Responses Test Insert Result:', {
            data: testInsert.data,
            error: testInsert.error,
            details: testInsert.error?.details,
            hint: testInsert.error?.hint,
            code: testInsert.error?.code
          });

          if (testInsert.error?.code === 'PGRST116') {
            console.log('Attempting fallback insert to question_responses...');
            const fallbackInsert = await supabase
              .from('question_responses')
              .insert({
                question_id: testQuestionId,
                user_id: session.user.id,
                response_text: 'Test response'
              })
              .select();
            console.log('Question Responses Fallback Test Insert Result:', {
              data: fallbackInsert.data,
              error: fallbackInsert.error,
              details: fallbackInsert.error?.details,
              hint: fallbackInsert.error?.hint,
              code: fallbackInsert.error?.code
            });
          }

          const testNotificationInsert = await supabase
            .from('notifications')
            .insert({
              user_id: session.user.id,
              message: 'Test notification'
            })
            .select();
          console.log('Notifications Test Insert Result:', {
            data: testNotificationInsert.data,
            error: testNotificationInsert.error,
            details: testNotificationInsert.error?.details,
            hint: testNotificationInsert.error?.hint,
            code: testNotificationInsert.error?.code
          });
        } else {
          console.log('No authenticated user for open_responses or notifications insert test');
        }
      } catch (err) {
        console.error('Table Test Query Error:', {
          message: err.message,
          details: err.details,
          code: err.code
        });
      }
    };
    testConnections();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size exceeds 10MB limit.');
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, the file is too large. Please upload a file smaller than 10MB.'
        }
      ]);
      return;
    }

    setIsLoading(true);
    setUploadError(null);

    try {
      const fileName = `${uuidv4()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('Uploads').upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const signedUrl = await fetchSignedUrl(fileName, 'Uploads');
      if (signedUrl) {
        const fileMessage = {
          id: uuidv4(),
          role: 'user',
          content: `Uploaded file: ${file.name}`,
          fileUrl: signedUrl
        };
        setMessages((prev) => [...prev, fileMessage]);

        const response = await axios.post(
          'http://localhost:3000/ask',
          {
            prompt: `User uploaded a file: ${file.name} for ${selectedCountry.name}`,
            fileUrl: signedUrl
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const aiMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response.data.response || `Received your file: ${file.name}`
        };
        setMessages((prev) => [...prev, aiMessage]);

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('notifications').insert({
            user_id: session.user.id,
            message: `You uploaded a file: ${file.name}`
          });
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError('Failed to upload file. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry mon! I couldn’t upload that file. Try again later!'
        }
      ]);
    } finally {
      setIsLoading(false);
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: `${activeAgent}: ${inputValue}`
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:3000/ask',
        {
          prompt: `${selectedCountry.name} ${activeAgent}: ${inputValue}`
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const aiMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.data.response || "Sorry, I couldn't process that request."
      };
      setMessages((prev) => [...prev, aiMessage]);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('notifications').insert({
          user_id: session.user.id,
          message: `New response from ${selectedCountry.name} ${activeAgent}`
        });
      }
    } catch (error) {
      console.error('API Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: "Sorry mon! I'm having a beach day! 🏖️ Try again later!"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: 'assistant',
            content: 'Error logging out. Please try again.'
          }
        ]);
        return;
      }
      setAvatarImage(null);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'You have been logged out successfully.'
        }
      ]);
      navigate('/login');
    } catch (err) {
      console.error('Unexpected logout error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Unexpected error during logout. Please try again.'
        }
      ]);
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const toggleCountryMenu = () => {
    setIsCountryMenuOpen(!isCountryMenuOpen);
  };

  const handleQuizAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === quiz.correct_answer) {
      setQuizFeedback('Correct! Well done!');
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: `You got it right! The answer to "${quiz.question}" is ${answer}.`
        }
      ]);
    } else {
      setQuizFeedback(`Incorrect. The correct answer is ${quiz.correct_answer}.`);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: `Nice try! For "${quiz.question}", the correct answer is ${quiz.correct_answer}.`
        }
      ]);
    }

    const addQuizNotification = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('notifications').insert({
          user_id: session.user.id,
          message: `You answered a quiz question: "${quiz.question}"`
        });
      }
    };
    addQuizNotification();

    setTimeout(() => {
      fetchQuiz().then(() => {
        setSelectedAnswer(null);
        setQuizFeedback('');
        setIsQuizCardOpen(false);
      });
    }, 2000);
  };

  const handleQuestionSubmit = async (retryCount = 0, maxRetries = 2) => {
    if (!userResponse.trim()) {
      setResponseFeedback('Please enter a response.');
      return;
    }

    if (!currentQuestion.id) {
      setResponseFeedback('Error: No valid question available.');
      return;
    }

    setIsLoading(true);
    try {
      const { data: questionData, error: questionError } = await supabase
        .from('open_questions')
        .select('id')
        .eq('id', currentQuestion.id)
        .single();

      if (questionError || !questionData) {
        console.error('Question ID validation error:', {
          message: questionError?.message,
          details: questionError?.details,
          code: questionError?.code
        });
        throw new Error('Invalid question ID');
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user?.id) {
        console.error('Authentication error:', {
          message: sessionError?.message,
          details: sessionError?.details,
          code: sessionError?.code
        });
        throw new Error('Please log in to submit a response.');
      }

      let insertResult = await supabase
        .from('open_responses')
        .insert({
          question_id: currentQuestion.id,
          user_id: session.user.id,
          response_text: userResponse
        })
        .select();

      if (insertResult.error?.code === 'PGRST116' && retryCount < maxRetries) {
        console.log(`open_responses not found, attempting question_responses (retry ${retryCount + 1})...`);
        insertResult = await supabase
          .from('question_responses')
          .insert({
            question_id: currentQuestion.id,
            user_id: session.user.id,
            response_text: userResponse
          })
          .select();
      }

      if (insertResult.error) {
        console.error('Insert error:', {
          message: insertResult.error.message,
          details: insertResult.error.details,
          hint: insertResult.error.hint,
          code: insertResult.error.code
        });
        if (insertResult.error.code === 'PGRST116' && retryCount < maxRetries) {
          setTimeout(() => handleQuestionSubmit(retryCount + 1, maxRetries), 1000);
          return;
        }
        throw new Error(`Failed to save response: ${insertResult.error.message || 'Unknown error'}`);
      }

      console.log('Response inserted successfully:', insertResult.data);

      await supabase.from('notifications').insert({
        user_id: session.user.id,
        message: `You submitted a response to: "${currentQuestion.question}"`
      });

      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: `Thanks for sharing your thoughts on: "${currentQuestion.question}"`
        }
      ]);

      setResponseFeedback('Response submitted! 🎉');

      setTimeout(() => {
        fetchQuestion().then(() => {
          setUserResponse('');
          setResponseFeedback('');
          setIsQuestionCardOpen(false);
        });
      }, 2000);
    } catch (err) {
      console.error('Submission failed:', {
        message: err.message,
        details: err.details,
        code: err.code
      });
      const feedbackMessage =
        err.message === 'Please log in to submit a response.'
          ? 'Please log in to submit a response.'
          : err.message.includes('PGRST116')
          ? 'Response table not found. Please contact support.'
          : err.message.includes('PGRST204')
          ? 'Invalid response column. Please contact support.'
          : 'Failed to save response. Please try again.';
      setResponseFeedback(feedbackMessage);
      setTimeout(() => {
        setResponseFeedback('');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (quizTimerRef.current) {
        clearTimeout(quizTimerRef.current);
      }
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current);
      }
      if (factTimerRef.current) {
        clearTimeout(factTimerRef.current);
      }
    };
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Signup', path: '/signup' },
    { name: 'Login', path: '/login' },
    { name: 'Profile', path: '/profile' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Saved Chats', path: '/saved-chats' },
    { name: 'Studio', path: '/playground' },
    { name: 'Report Issue', path: '/report' },
    { name: 'Workbench', path: '/workbench' },
    { name: 'Packages', path: '/packages' },
    { name: 'Settings', path: '/settings' },
    { name: 'Help', path: '/help' },
    {
      name: 'Logout',
      path: '/login',
      onClick: async (e) => {
        e.stopPropagation();
        await handleLogout();
        setIsNavOpen(false);
      }
    }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isNavOpen && !e.target.closest('.nav-card') && !e.target.closest('.hamburger-button')) {
        setIsNavOpen(false);
      }
      if (!e.target.closest('.agent-menu') && !e.target.closest('.agent-menu-container')) {
        setIsAgentMenuOpen(false);
      }
      if (!e.target.closest('.submit-menu') && !e.target.closest('.submit-menu-container')) {
        setIsSubmitMenuOpen(false);
      }
      if (!e.target.closest('.country-menu') && !e.target.closest('.barbados-flag')) {
        setIsCountryMenuOpen(false);
      }
      if (isFactsCardOpen && !e.target.closest('.facts-card') && !e.target.closest('.facts-card-close')) {
        setIsFactsCardOpen(false);
      }
      if (
        isQuizCardOpen &&
        !e.target.closest('.quiz-card') &&
        !e.target.closest('.quiz-card-close') &&
        !e.target.closest('.nav-item') &&
        !selectedAnswer
      ) {
        setIsQuizCardOpen(false);
        setSelectedAnswer(null);
        setQuizFeedback('');
      }
      if (
        isQuestionCardOpen &&
        !e.target.closest('.question-card') &&
        !e.target.closest('.question-card-close') &&
        !e.target.closest('.nav-item')
      ) {
        setIsQuestionCardOpen(false);
        setUserResponse('');
        setResponseFeedback('');
        if (questionTimerRef.current) {
          clearTimeout(questionTimerRef.current);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isNavOpen, isAgentMenuOpen, isSubmitMenuOpen, isCountryMenuOpen, isFactsCardOpen, isQuizCardOpen, isQuestionCardOpen, selectedAnswer]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('sports_quizzes')
          .select('question, options, correct_answer')
          .limit(1);
        console.log('Quiz Test Query Result:', { data, error });
      } catch (err) {
        console.error('Quiz Test Query Error:', err);
      }
    };
    testConnection();
  }, []);

  return (
    <div className="baje-container">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            className="ai-avatar"
            style={{
              ...(avatarImage && { backgroundImage: `url(${avatarImage})`, backgroundColor: 'transparent' })
            }}
          >
            {!avatarImage && 'ISLE'}
          </div>
          <div className="ai-info">
            <div className="ai-name">ISLE</div>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <div className="ai-status">Your {selectedCountry.name} Guide</div>
              <div
                className="barbados-flag"
                onClick={toggleCountryMenu}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: `url(${selectedCountry.flagUrl}) center/cover`,
                  marginLeft: '10px',
                  cursor: 'pointer'
                }}
              />
              <div
                className="country-menu"
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(50, 50, 50, 0.9)',
                  borderRadius: '10px',
                  padding: '20px',
                  display: isCountryMenuOpen ? 'flex' : 'none',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '15px',
                  maxWidth: '600px',
                  zIndex: 1000,
                  boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.5)'
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    color: 'white',
                    fontSize: '18px',
                    textAlign: 'center',
                    marginBottom: '10px'
                  }}
                >
                  Choose your Destination...
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '15px'
                  }}
                >
                  {caribbeanCountries.map((country) => (
                    <div
                      key={country.name}
                      style={{
                        width: '150px',
                        padding: '10px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        textAlign: 'center',
                        flexDirection: 'column',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => {
                        setSelectedCountry(country);
                        setIsCountryMenuOpen(false);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          background: `url(${country.flagUrl}) center/cover`,
                          borderRadius: '50%',
                          marginBottom: '5px'
                        }}
                      />
                      <span style={{ fontSize: '14px' }}>{country.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="header-buttons">
          <button
            className="report-button"
            onClick={() => navigate('/report')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.3s ease'
            }}
          >
            <img src="https://cdn-icons-png.flaticon.com/512/3566/3566696.png" alt="Report" style={{ width: '24px', height: '24px' }} />
          </button>
          <div className="bell-container" style={{ display: 'flex', marginRight: '8px' }}>
            <button
              className="notification-button"
              onClick={() => navigate('/notifications')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.3s ease',
                fontSize: '18px'
              }}
            >
              🔔
            </button>
            <span
              className="badge"
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-12px',
                backgroundColor: 'red',
                color: 'white',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '50%',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                visibility: notificationCount > 0 ? 'visible' : 'hidden',
                boxShadow: '0 0 0 2px white'
              }}
            >
              {notificationCount}
            </span>
          </div>
          <button className={`hamburger-button ${isNavOpen ? 'active' : ''}`} onClick={toggleNav}>
            <span className="hamburger-button-span"></span>
            <span className="hamburger-button-span"></span>
            <span className="hamburger-button-span"></span>
          </button>
        </div>
      </div>

      <div className={`nav-overlay ${isNavOpen || isCountryMenuOpen || isQuizCardOpen || isQuestionCardOpen ? 'active' : ''}`}>
        <div className={`nav-card ${isNavOpen ? 'nav-card-open' : ''}`}>
          <button className="close-nav" onClick={toggleNav}>✕</button>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.name} className="nav-item">
                <Link
                  to={item.path}
                  className="nav-item-a"
                  onClick={item.onClick || (() => setIsNavOpen(false))}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message" style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.fileUrl ? (
              <>
                <div>{msg.content}</div>
                {msg.fileUrl.includes('.jpg') || msg.fileUrl.includes('.png') || msg.fileUrl.includes('.jpeg') ? (
                  <img src={msg.fileUrl} alt="Uploaded" style={{ maxWidth: '200px', marginTop: '10px' }} />
                ) : (
                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                    View File
                  </a>
                )}
              </>
            ) : (
              msg.content
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message">
            <div style={{ display: 'flex', gap: '5px' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ccc',
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div
        className="facts-card"
        style={{
          position: 'absolute',
          bottom: '90px',
          right: '15px',
          width: '250px',
          background: '#F5F5F5',
          borderRadius: '10px',
          padding: '15px',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)',
          display: isFactsCardOpen ? 'block' : 'none',
          zIndex: 999
        }}
      >
        <button
          className="facts-card-close"
          onClick={() => setIsFactsCardOpen(false)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: 'black'
          }}
        >
          ✕
        </button>
        <div
          style={{
            fontWeight: 'bold',
            color: 'black',
            fontSize: '16px',
            marginBottom: '10px'
          }}
        >
          Did you know?
        </div>
        <div
          style={{
            color: 'black',
            fontSize: '14px',
            marginBottom: '8px'
          }}
        >
          {fact.question}
        </div>
        <div
          style={{
            color: '#008000',
            fontSize: '14px'
          }}
        >
          {fact.answer}
        </div>
      </div>

      <div
        className="quiz-card"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          background: '#F5F5F5',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.5)',
          display: isQuizCardOpen ? 'block' : 'none',
          zIndex: 9999,
          color: 'black',
          textAlign: 'center'
        }}
      >
        <button
          className="quiz-card-close"
          onClick={() => {
            setIsQuizCardOpen(false);
            setSelectedAnswer(null);
            setQuizFeedback('');
            if (quizTimerRef.current) {
              clearTimeout(quizTimerRef.current);
            }
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: 'black'
          }}
        >
          ✕
        </button>
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '16px',
            marginBottom: '15px'
          }}
        >
          {selectedCountry.name} Quiz
        </div>
        <div
          style={{
            fontSize: '14px',
            marginBottom: '15px'
          }}
        >
          {quiz.question}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {quiz.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleQuizAnswer(option)}
              disabled={selectedAnswer !== null}
              style={{
                background: selectedAnswer === option ? (option === quiz.correct_answer ? '#008000' : '#FF0000') : '#1E90FF',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '10px',
                cursor: selectedAnswer === null ? 'pointer' : 'default',
                opacity: selectedAnswer === null ? 1 : 0.7,
                transition: 'background 0.3s ease'
              }}
            >
              {option}
            </button>
          ))}
        </div>
        {quizFeedback && (
          <div
            style={{
              marginTop: '15px',
              fontSize: '14px',
              color: quizFeedback.includes('Correct') ? '#008000' : '#FF0000'
            }}
          >
            {quizFeedback}
          </div>
        )}
      </div>

      <div
        className="question-card"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          background: '#F5F5F5',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.5)',
          display: isQuestionCardOpen ? 'block' : 'none',
          zIndex: 10000,
          color: 'black',
          textAlign: 'center'
        }}
      >
        <button
          className="question-card-close"
          onClick={() => {
            setIsQuestionCardOpen(false);
            setUserResponse('');
            setResponseFeedback('');
            if (questionTimerRef.current) {
              clearTimeout(questionTimerRef.current);
            }
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: 'black'
          }}
        >
          ✕
        </button>
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '16px',
            marginBottom: '15px'
          }}
        >
          {selectedCountry.name} Question
        </div>
        <div
          style={{
            fontSize: '14px',
            marginBottom: '15px'
          }}
        >
          {currentQuestion.question}
        </div>
        <textarea
          rows={4}
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          placeholder="Type your response here..."
          style={{
            width: '90%',
            margin: '0 auto',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            resize: 'none',
            fontSize: '14px',
            display: 'block'
          }}
          disabled={isLoading}
        />
        <button
          onClick={() => handleQuestionSubmit()}
          disabled={isLoading}
          style={{
            background: '#1E90FF',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px',
            marginTop: '10px',
            cursor: isLoading ? 'default' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            transition: 'background 0.3s ease'
          }}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
        {responseFeedback && (
          <div
            style={{
              marginTop: '15px',
              fontSize: '14px',
              color: responseFeedback.includes('submitted') ? '#008000' : '#FF0000'
            }}
          >
            {responseFeedback}
          </div>
        )}
      </div>

      <div className="input-section" style={{ display: 'flex', alignItems: 'center', padding: '15px', background: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="plus-menu-container" style={{ position: 'relative', marginRight: '10px' }}>
          <button
            className="plus-button"
            onClick={() => fileInputRef.current.click()}
            style={{
              background: '#1E90FF',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              transition: '0.3s ease'
            }}
          >
            +
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e.target.files[0])}
          accept="image/*,application/pdf"
        />
        <textarea
          className="input-field"
          rows={2}
          placeholder={`Ask me about ${selectedCountry.name}...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          style={{ flexGrow: 1, marginRight: '10px' }}
        />
        <div
          className="agent-menu-container"
          style={{ position: 'relative', marginRight: '10px' }}
          onMouseEnter={() => setIsAgentMenuOpen(true)}
          onMouseLeave={() => setIsAgentMenuOpen(false)}
        >
          <button
            className="agent-button"
            style={{
              background: '#1E90FF',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              transition: '0.3s ease'
            }}
          >
            {agentIcon}
          </button>
          <div
            className="agent-menu"
            style={{
              position: 'absolute',
              bottom: '100%',
              right: '0',
              background: 'rgba(0, 0, 0, 0.9)',
              borderRadius: '5px',
              padding: '5px',
              display: isAgentMenuOpen ? 'block' : 'none',
              opacity: isAgentMenuOpen ? 1 : 0,
              transition: 'opacity 0.2s',
              zIndex: 1000
            }}
          >
            {['Main', 'Tourism', 'Traffic'].map((agent) => (
              <div
                key={agent}
                style={{
                  padding: '5px 10px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={() => {
                  setActiveAgent(agent);
                  setAgentIcon(agent === 'Main' ? '🤖' : agent === 'Tourism' ? '🏖️' : '🚦');
                  setIsAgentMenuOpen(false);
                }}
              >
                {agent === 'Main' && '🤖'}
                {agent === 'Tourism' && '🏖️'}
                {agent === 'Traffic' && '🚦'}
                <span style={{ marginLeft: '5px' }}>{agent}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          className="submit-menu-container"
          style={{ position: 'relative' }}
          onMouseEnter={() => setIsSubmitMenuOpen(true)}
          onMouseLeave={() => setIsSubmitMenuOpen(false)}
        >
          <button
            className="submit-button"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            style={{
              background: '#1E90FF',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              transition: '0.3s ease'
            }}
          >
            {submitIcon}
          </button>
          <div
            className="submit-menu"
            style={{
              position: 'absolute',
              bottom: '100%',
              right: '0',
              background: 'rgba(0, 0, 0, 0.9)',
              borderRadius: '5px',
              padding: '5px',
              display: isSubmitMenuOpen ? 'block' : 'none',
              opacity: isSubmitMenuOpen ? 1 : 0,
              transition: 'opacity 0.2s',
              zIndex: 1000
            }}
          >
            {['text', 'voice', 'img', 'maps'].map((option) => (
              <div
                key={option}
                style={{
                  padding: '5px 10px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={() => {
                  console.log(`Submitting as ${option}`);
                  setSubmitIcon(option === 'text' ? '📝' : option === 'voice' ? '🎙️' : option === 'img' ? '📷' : '🗺️');
                  setIsSubmitMenuOpen(false);
                }}
              >
                {option === 'text' && '📝'}
                {option === 'voice' && '🎙️'}
                {option === 'img' && '📷'}
                {option === 'maps' && '🗺️'}
                <span style={{ marginLeft: '5px' }}>{option}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .chat-header {
          position: sticky;
          top: 0;
          z-index: 1001;
        }
        .nav-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0);
          z-index: 999;
          transition: background 0.3s ease;
          visibility: hidden;
        }
        .nav-overlay.active {
          background: rgba(0, 0, 0, 0.5);
          visibility: visible;
        }
        .nav-card {
          position: fixed;
          top: 0;
          right: -300px;
          width: 250px;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          padding: 20px;
          transition: right 0.3s ease;
          z-index: 1000;
          visibility: hidden;
          border-radius: 10px;
          box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .nav-card.nav-card-open {
          right: 0;
          visibility: visible;
        }
        .close-nav {
          background: transparent;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          position: absolute;
          top: 10px;
          right: 10px;
        }
        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .nav-item {
          margin: 5px 0;
          width: 100%;
          text-align: center;
        }
        .nav-item-a {
          color: white;
          text-decoration: none;
          font-size: 18px;
          font-family: var(--default-font-family);
          transition: color 0.2s ease;
          display: block;
          padding: 10px 0;
        }
        .nav-item-a:hover {
          color: #1E90FF;
        }
        .hamburger-button.active .hamburger-button-span {
          background: white;
        }
        .hamburger-button.active .hamburger-button-span:nth-child(1) {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        }
        .hamburger-button.active .hamburger-button-span:nth-child(2) {
          opacity: 0;
        }
        .hamburger-button.active .hamburger-button-span:nth-child(3) {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
        }
        .report-button:hover, .notification-button:hover {
          background: #1E90FF;
        }
        .plus-button:hover, .agent-button:hover, .submit-button:hover, .barbados-flag:hover {
          background: #1873CC;
        }
        .message {
          max-width: 70%;
          margin: 10px;
          border-radius: 5px;
          padding: 10px;
        }
        .message img {
          max-width: 200px;
          border-radius: 5px;
          margin: 10px;
        }
        .message a {
          color: #1E90FF;
          text-decoration: none;
        }
        .message a:hover {
          text-decoration: underline;
        }
        .bell-container {
          position: relative;
          width: 30px;
          height: 30px;
          cursor: pointer;
        }
        .badge {
          position: absolute;
          top: -8px;
          right: -12px;
          background-color: red;
          color: white;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 50%;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          visibility: hidden;
          box-shadow: 0 0 0 2px white;
        }
        .bell-container .badge {
          visibility: visible;
        }
        @media only screen and (max-width: 450px) {
          .chat-header {
            padding: 10px;
          }
          .hamburger-button {
            margin-left: auto;
          }
          .nav-card {
            width: 100%;
            max-width: 450px;
            right: -450px;
            border-radius: 0;
          }
          .nav-card.nav-card-open {
            right: 0;
          }
          .nav-item {
            margin: 5px 0;
          }
          .nav-item-a {
            font-size: 18px;
          }
          .input-section {
            flex-direction: column;
            align-items: stretch;
          }
          .plus-menu-container {
            margin-bottom: 10px;
          }
          .agent-menu, .submit-menu {
            right: 0;
            left: 50%;
            transform: translateX(-50%);
          }
          .country-menu {
            max-width: 90%;
            padding: 10px;
            gap: 10px;
          }
          .country-menu > div {
            width: 120px;
            font-size: 12px;
          }
          .facts-card {
            width: 200px;
            right: 10px;
            bottom: 80px;
            padding: 10px;
          }
          .facts-card div {
            font-size: 12px !important;
          }
          .quiz-card {
            width: 90%;
            max-width: 300px;
            padding: 15px;
          }
          .quiz-card div {
            font-size: 12px !important;
          }
          .question-card {
            width: 90%;
            max-width: 300px;
            padding: 15px;
          }
          .question-card div, .question-card textarea {
            font-size: 12px !important;
          }
          .question-card textarea {
            width: 90% !important;
            margin: 0 auto !important;
            display: block !important;
          }
          .bell-container {
            width: 25px;
            height: 25px;
          }
          .notification-button {
            width: 25px;
            height: 25px;
            font-size: 14px;
          }
          .badge {
            font-size: 10px;
            padding: 1px 4px;
            top: -3px;
            right: -3px;
          }
        }
        @media only screen and (min-width: 451px) and (max-width: 1024px) {
          .bell-container {
            width: 28px;
            height: 28px;
          }
          .notification-button {
            width: 28px;
            height: 28px;
            fontSize: 15px;
          }
          .badge {
            font-size: 11px;
            padding: 2px 5px;
            top: -4px;
            right: -4px;
          }
        }
      `}</style>
    </div>
  );
}

function BajeWithTour() {
  const location = useLocation();
  const steps = [
    {
      selector: '.input-section',
      content: 'Ask questions about your selected country or upload files here.',
    },
    {
      selector: '.notification-button',
      content: 'View notifications like quiz results or responses here.',
    },
    {
      selector: '.report-button',
      content: 'Report issues like traffic or infrastructure problems here.',
    },
    {
      selector: '.hamburger-button',
      content: 'Access the navigation menu to explore features like Dashboard or Settings.',
    },
    {
      selector: '.barbados-flag',
      content: 'Change your country to explore different Caribbean destinations.',
    },
  ];

  useEffect(() => {
    if (location.state?.startTour) {
      console.log('Tour: startTour detected in location.state');
      // Validate selectors and filter out invalid ones
      const validSteps = steps.filter(step => {
        const element = document.querySelector(step.selector);
        console.log(`Tour: Checking selector ${step.selector}: ${element ? 'Found' : 'Not found'}`);
        return !!element;
      });

      if (validSteps.length === 0) {
        console.error('Tour: No valid selectors found, aborting tour');
        return;
      }

      if (validSteps.length < steps.length) {
        console.warn('Tour: Some selectors are missing, proceeding with valid steps:', validSteps);
      }

      // Wait longer to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        console.log('Tour: Starting tour with steps:', validSteps);
        // Set steps and open tour via TourProvider props
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      console.log('Tour: No startTour in location.state, skipping tour');
    }
  }, [location.state]);

  return (
    <TourProvider
      steps={steps}
      afterOpen={() => console.log('Tour: Started')}
      onClickClose={() => {
        console.log('Tour: Closed via close button');
      }}
      afterClose={() => {
        console.log('Tour: Completed or closed');
      }}
      styles={{
        popover: (base) => ({
          ...base,
          backgroundColor: '#1e1e1e',
          color: '#fff',
          borderRadius: '10px',
          zIndex: 10001,
          padding: '15px',
          maxWidth: '300px',
          visibility: 'visible',
          opacity: 1,
        }),
        button: (base) => ({
          ...base,
          backgroundColor: '#5db075',
          color: '#fff',
          borderRadius: '8px',
          padding: '8px 16px',
          border: 'none',
          cursor: 'pointer',
        }),
        close: (base) => ({
          ...base,
          color: '#ff4d4d',
          fontSize: '16px',
          padding: '5px',
        }),
      }}
      onError={(error) => {
        console.error('Tour: Error occurred:', error);
      }}
      startAt={0}
      setCurrentStep={(step) => console.log('Tour: Current step:', step)}
    >
      <Baje />
    </TourProvider>
  );
}

export default BajeWithTour;