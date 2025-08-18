import "./style.css";

type paramsType = { handleCloseModal: () => void, result?: boolean, selectedWord?: string, answer?: any, handlePlayAgain?: () => void, isOptions?: boolean, isHelp?: boolean, isGameOver?: boolean }
const ContainerModal = ({ handleCloseModal, handlePlayAgain, result, selectedWord, answer, isOptions, isHelp, isGameOver }: paramsType) => {
    return (
        <section className="overflow-canva">
            <section className='modal-container'>
                <p className="close-modal" onClick={handleCloseModal}>X</p>
                {
                    isGameOver && (
                        <div className="game-over">
                            {
                                result ? (
                                    <p style={{ color: "#f9c043" }}>You are the new Worden lord</p>
                                ) : (
                                    <p>YOU DIED</p>
                                )
                            }

                            <div>
                                <h2>{selectedWord}</h2>
                                <img src={answer.image} alt="" />
                                <p>{answer.description}</p>
                            </div>

                            <button onClick={handlePlayAgain}>Play Again</button>
                        </div>
                    )
                }

                {
                    isOptions && (
                        <div className="about-game">
                            <h2>Greetings, Tarnished.</h2>

                            <p><strong>Worden Ring</strong> was forged in September 2025 by <a href="https://www.instagram.com/jlucasgf/">José Lucas</a> a devoted wanderer of both <strong>Elden Ring</strong> and <a href='https://www.nytimes.com/games/wordle/index.html'>Wordle</a>.
                                A twisted reflection of Wordle, reborn within the Lands Between.</p>

                            <p>This trial surpasses even the mightiest of foes.
                                To endure, one must wield knowledge beyond mortal bounds, more than <strong>99 Intelligence</strong>, shattering the very limits set by Elden Ring itself.</p>

                            <p>Every word is drawn from the deep lore of the <a href='https://eldenring.fanapis.com/'>Elden Ring Fans API</a>: the names of bosses, relics, weapons, and legends scattered throughout the realm.</p>

                            <p>No personal data is taken. No cookies. No tracking.
                                Only your will… and your guesses… shall determine your fate.</p>

                        </div>
                    )
                }

                {
                    isHelp && (
                        <div className="about-game">
                            <h2>Help</h2>

                            <p>Uncover the hidden word from the world of <strong>Elden Ring</strong>: bosses, items, weapons, or places.</p>

                            <ul>
                                <li>🟩 Correct letter & spot</li>
                                <li>🟨 Letter exists, wrong place</li>
                                <li>⬛ Letter not in word</li>
                            </ul>

                            <p>Beware: <br /><strong style={{ fontSize: "32px" }}>␣</strong> = space inside the word.
                                <br />The apostrophe <strong>'</strong> is auto-filled for you.
                                (Yes, there are apostrophes, and yes, this is harder than <strong>Elden Ring</strong>!)</p>

                            <p>This trial is said to be harder than Elden Ring itself.
                                To prevail, you must wield patience, wit, and more than <strong>99 Intelligence</strong>.</p>

                            <p>May your guesses strike true, and may Grace guide your words.</p>

                        </div>
                    )
                }

            </section>
        </section>
    );
}

export default ContainerModal;