import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaTimes } from 'react-icons/fa';

// Animasyonlar
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const scaleUp = keyframes`from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; }`;

// Stiller
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85); /* Daha koyu arkaplan */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200; /* Diğer modalların üzerinde olsun */
  padding: 2rem;
  opacity: 0;
  animation: ${fadeIn} 0.3s ease-out forwards;
  cursor: pointer; /* Overlay'a tıklayarak kapatmak için */
`;

const ModalContent = styled.div`
  position: relative; // Close button için
  background: none; // İçerik arka planı olmasın, sadece resim görünsün
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  width: 600px;  /* İstediğiniz sabit genişlik */
  height: 600px;
  display: flex; // Resmi ortalamak için
  justify-content: center;
  align-items: center;
  opacity: 0;
  transform: scale(0.9);
  animation: ${scaleUp} 0.3s 0.1s ease-out forwards;
  cursor: default; // İçeriğe tıklayınca kapanmasın
`;

const CloseButton = styled.button`
  position: absolute;
  top: -15px; // İçeriğin biraz dışına taşsın
  right: -15px;
  background: #333; // Koyu buton
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: background-color 0.2s ease, transform 0.2s ease;
  z-index: 1201;

  &:hover {
    background-color: #dc3545; // Kırmızı hover
    transform: scale(1.1);
  }
`;

const LargeImage = styled.img`
  display: block;
  max-width: 100%; // İçeriğin genişliğine sığsın
  max-height: 100%; // İçeriğin yüksekliğine sığsın
  object-fit: contain; // Oranını koru
  border-radius: 4px; // Hafif köşe yuvarlaklığı
`;

const ImageZoomModal = ({ isOpen, onClose, imageUrl }) => {
  // Eğer açık değilse veya resim URL'si yoksa hiçbir şey render etme
  if (!isOpen || !imageUrl) {
    return null;
  }

  // Overlay'a tıklandığında modalı kapat
  const handleOverlayClick = () => {
    onClose();
  };

  // Resmin olduğu content'e tıklandığında overlay click'i engelle
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent onClick={handleContentClick}>
        <CloseButton onClick={onClose} aria-label="Close image zoom">
          <FaTimes />
        </CloseButton>
        <LargeImage src={imageUrl} alt="Trolley Type Large View" />
      </ModalContent>
    </ModalOverlay>
  );
};

export default ImageZoomModal;