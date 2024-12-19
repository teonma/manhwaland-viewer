// card-url-list.tsx
import React from 'react';

interface CardUrlListProps {
    cardUrls: string[];
}

const CardUrlList: React.FC<CardUrlListProps> = ({ cardUrls }) => {
    if (!cardUrls || cardUrls.length === 0) {
        return <p>No card urls found.</p>;
    }

    return (
        <ul>
            {cardUrls.map((cardUrl, index) => (
                <li key={index}>
                  <a href={cardUrl} target="_blank" rel="noopener noreferrer">{cardUrl}</a>
                </li>
            ))}
        </ul>
    );
};

export default CardUrlList;

