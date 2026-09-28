// index.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ChatProvider } from './contexts/ChatContext';
import { CardsProvider } from './contexts/CardsContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <UserProvider>
        <SocketProvider>
          <CardsProvider>
          <NotificationProvider>
            <ChatProvider>
              <App />
            </ChatProvider>
          </NotificationProvider>
          </CardsProvider>
        </SocketProvider>
      </UserProvider>
    </BrowserRouter>
);