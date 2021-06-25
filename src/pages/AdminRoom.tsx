import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { Question } from '../components/Question';
import { useHistory, useParams } from 'react-router-dom'
import { useRoom } from '../hooks/useRoom';
import imgLogo from '../assets/images/logo.svg'
import deleteImg from '../assets/images/delete.svg'
import checkImg from '../assets/images/check.svg';
import { database } from '../services/firebase';
import answerImg from '../assets/images/answer.svg';
import emptyImg from '../assets/images/empty-questions.svg';
import '../styles/room.scss'
import { useAuth } from '../hooks/useAuth';

type RoomParams = {
  id: string;
}

export function AdminRoom() {
  const history = useHistory();
  const params = useParams<RoomParams>();
  const roomId = params.id;
  const { title, questions } = useRoom(roomId);
  const { user, signOut } = useAuth()


  async function handleDeleteQuestion(questionId: string) {
    if (window.confirm('Tem certeza que deseja remover a pergunta?')) {
      try {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).remove()
      } catch (e) {
        alert("Você não tem autorização para executar esta ação!");
      }
    }
  }

  async function handleEndRoom() {
    try {
      await database.ref(`rooms/${roomId}`).update({
        endedAt: new Date()
      })
      history.push('/')
    } catch (e) {
      alert("Você não tem autorização para executar esta ação!");
    }
  }

  async function handleCheckQuestionAsAnswered(questionId: string) {
    try {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
        isAnswered: true,
      })
    } catch (e) {
      alert("Você não tem autorização para executar esta ação!");
    }
  }

  async function handleHighlightQuestion(questionId: string) {
    try {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
        isHighlighted: true,
      })
    } catch (e) {
      alert("Você não tem autorização para executar esta ação!");
    }
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <a href="/">
            <img src={imgLogo} alt="Logo" />
          </a>
          <div>
            <RoomCode code={roomId} />
            <Button isOutlined onClick={handleEndRoom}>Encerrar Sala</Button>
            {user && <Button isOutlined onClick={signOut}>Sair</Button>}
          </div>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
        </div>

        <div className="question-list">
          <div className="empty-question-list">
            {questions.length === 0 && (
              <div className="no-questions">
                <img src={emptyImg} alt="Sem perguntas" />
                <h1>Nenhuma pergunta ainda!</h1>
              </div>
            )}
          </div>
          {questions.map(question => {
            return (
              <Question
                key={question.id}
                content={question.content}
                author={question.author}
                isAnswered={question.isAnswered}
                isHighlighted={question.isHighlighted}
              >
                {!question.isAnswered && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCheckQuestionAsAnswered(question.id)}
                    >
                      <img src={checkImg} alt="Marcar pergunta como respondida" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHighlightQuestion(question.id)}
                    >
                      <img src={answerImg} alt="Dar destaque à pergunta" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <img src={deleteImg} alt="Remover Pergunta" />
                </button>
              </Question>
            );
          })}
        </div>
      </main>
    </div>
  );
}