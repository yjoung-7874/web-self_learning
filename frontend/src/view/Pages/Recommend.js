import React, {useState, useEffect} from "react"
import RecommendList from '../Component/List/RecommendList'
import BookmarkModal from "../Component/Modal/BookmarkModal"
import OptionCard from "../Component/Card/OptionCard"
import { Spin, Card, Row, Col, Button, Alert, Typography } from "antd"
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { Actions as dataAction } from '../../store/actions/dataActions'
import { useLocation, useNavigate } from 'react-router-dom'

const { Text, Title } = Typography;

export default function Recommend () {
  const dispatch = useDispatch();
  const Location = useLocation()
  const navigate = useNavigate()
  useEffect(() => !localStorage.getItem('authToken') ? 
    navigate('/login') : 
    navigate('/Recommended')
, []);
  const [isBookmarkModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(<></>);
  const [wrongCount, setWrongCount] = useState(0);
  const closeBookmarkModal = () => {setIsRecommendationModalOpen(false)};
  const [listContent, setListContent] = useState([]);
  const [problemNumber, setProblemNumber] = useState(1); 
  const MAX_PROBLEM = 50;

  const wrongNum = [];
  for(let i = 0; i <= 10; i++) {
    wrongNum.push({ value: i, label: i, })
  }
  const problemNum = [];
  for(let i = 1; i <= MAX_PROBLEM; i++) {
    problemNum.push({ value: i, label: i, })
  }

  const { data, isLoading } = useSelector((state) => {
    let data = state.data;
    let isLoading = state.data.loadingData

    return { 
      data: data ? data : undefined, 
      isLoading: isLoading
    }
  }, shallowEqual)

  let pathSnippets = Location.pathname.split('/')
  pathSnippets = pathSnippets.filter((i) => i)
  
  useEffect(()=> {
    pathSnippets[0] !== 'Recommended' && setIsDataClicked(false)
  }, [pathSnippets])

  const [isDataClicked, setIsDataClicked] = useState(false); 
  const onSubmitClicked = () => {
    console.log('getQuestion called in ProblemList')
    dispatch(dataAction.getQuestions({
      userEmail: localStorage.getItem('userEmail'),
      questionNumber: problemNumber,
      difficulty: [1, 2, 3],
      timezone: [1, 2, 3],
      paper: [1, 2, 3],
      chapter: [1,2,3,4,5,6,7,8,9,10,11,12],
      wrong: parseInt(wrongCount[0]),
    }))
    setIsDataClicked(true) 
  }

  useEffect(() => {
    console.log("Data! which is ", data);
    (data && isDataClicked === true) ? setListContent(data.data) : setListContent([])
  }, [data, isDataClicked])

  const style={margin: 10}

    return (
      <>
      <Card title={<Text>Configuration</Text>}>
        <Row span={24}>
          <Col span={12}>
            <Row span={24}>
              <Col span={10} style={style}>
                <OptionCard useSwitch={false} items={problemNum} title={'Problem Number'} update={setProblemNumber} isSingleSelect={true}/>
              </Col>
              <Col span={10} style={style}>
                <OptionCard useSwitch={false} items={wrongNum} title={'Wrongs'} update={setWrongCount} isSingleSelect={true}/>
              </Col>
            </Row>  
          </Col>
          <Col span={12}>
            <Alert message="Instruction" type="info" showIcon />   
            <br />       
            <Text>- Select a number from 'Problem number' to submit how many number you would like to solve.</Text><br />
            <Text>- Select a number from ''Wrong' to submit the level of times you got it wrong.</Text><br />
            <Text>  : if you select 5, questions you got wrong over 5 times will be displayed</Text><br />
            <Text>- If you are ready, click the "Submit" button.</Text>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{textAlign: 'right'}}>
            <Button onClick={onSubmitClicked}>Submit</Button>
          </Col>
        </Row>
      </Card>
      <Row span={24}>
        <Col span={24}>
          { isLoading ? <Spin/> : <>
            <RecommendList onItemClicked={()=>setIsRecommendationModalOpen(true)} setModalContent={setModalContent} listContent = {listContent}/>
            <BookmarkModal open={isBookmarkModalOpen} onClosed={closeBookmarkModal} modalContent = {modalContent}/>
          </>}
        </Col>
      </Row>
    
      </>
    )
}