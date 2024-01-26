import React, { useState, useEffect } from "react"
import { useSelector, shallowEqual } from 'react-redux';
import { Spin } from 'antd';

import BookmarkedList from '../../Component/List/BookmarkedList'
import BookmarkModal from "../../Component/Modal/BookmarkModal"
import { useNavigate } from 'react-router-dom';

export default function Bookmark () {
    const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(<></>);

    const closeBookmarkModal = () => {setIsBookmarkModalOpen(false)};
    
    const navigate = useNavigate()
    useEffect(() => !localStorage.getItem('authToken') ? 
                        navigate('/login') : 
                        navigate('/Review/Bookmark')
    , []);

    return ( 
    <>
        <BookmarkedList onItemClicked={()=>setIsBookmarkModalOpen(true)} setModalContent={setModalContent}/>
        <BookmarkModal open={isBookmarkModalOpen} onClosed={closeBookmarkModal} modalContent = {modalContent}/>
    </>
    )
}