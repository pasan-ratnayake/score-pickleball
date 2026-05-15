import './RulesContent.css';

import { CourtDiagram } from './CourtDiagram';

export function RulesContent() {
    return (
        <div className="rules-content">
            <h2 className="rules-title">How to Play Pickleball</h2>

            <article className="rules-section">
                <h3 className="rule-heading">
                    <span className="rule-icon">🏅</span> What is Pickleball?
                </h3>
                <p>
                    Pickleball is a fast-growing paddle sport that combines elements of tennis,
                    badminton, and ping-pong. It&apos;s played on a compact court with a solid
                    paddle and a lightweight plastic ball with holes.
                </p>
                <p>
                    It&apos;s easy to learn, great for all ages, and can be played as{' '}
                    <span className="hl">singles</span> (1 vs 1) or{' '}
                    <span className="hl">doubles</span> (2 vs 2).
                </p>
            </article>

            <article className="rules-section">
                <h3 className="rule-heading">
                    <span className="rule-icon">🟩</span> The Court
                </h3>
                <p>
                    A pickleball court is <span className="hl">44 feet long</span> and{' '}
                    <span className="hl">20 feet wide</span> — about the size of a badminton
                    court. Here&apos;s what each zone is called:
                </p>

                <CourtDiagram />

                <p>
                    The <span className="hl">Kitchen</span> (officially the Non-Volley Zone, or
                    NVZ) is the 7-foot zone on each side of the net. The{' '}
                    <span className="hl">Service Boxes</span> are behind the kitchen, divided by
                    a centre line.
                </p>
            </article>

            <article className="rules-section">
                <h3 className="rule-heading">
                    <span className="rule-icon">🎾</span> Serving
                </h3>
                <p>
                    The serve must be made <span className="hl">underhand</span> — your paddle
                    must contact the ball below your waist. The ball must be hit in the air (not
                    bounced first).
                </p>
                <p>
                    The serve must land in the <span className="hl">diagonal service box</span>{' '}
                    across the net. It must clear the kitchen — a serve that lands in the
                    kitchen is a fault.
                </p>
                <p>
                    In <span className="hl">doubles</span>, both players on a team get to serve
                    before the serve rotates to the other team (except at the very start of the
                    game, when only one serve is given).
                </p>
                <p>
                    In <span className="hl">singles</span>, serve from the{' '}
                    <span className="hl">right side</span> when your score is even, and the{' '}
                    <span className="hl">left side</span> when your score is odd.
                </p>
            </article>

            <article className="rules-section">
                <h3 className="rule-heading">
                    <span className="rule-icon">🔄</span> Serve Rotation
                </h3>

                <p style={{ marginBottom: 12 }}>
                    How the serve moves depends on whether you&apos;re playing singles or
                    doubles.
                </p>

                <p className="subhead">Doubles</p>
                <ul className="rules-list" style={{ marginBottom: 14 }}>
                    <li>
                        <span className="hl">Serving team scores</span> → same server keeps
                        serving. No rotation.
                    </li>
                    <li>
                        <span className="hl">Serving team loses the rally</span> → the{' '}
                        <em>other player</em> on the same team becomes Server 2 and serves next.
                    </li>
                    <li>
                        <span className="hl">Server 2 also loses</span> → the serve rotates to
                        the opposing team. Their Server 1 starts.
                    </li>
                    <li>
                        <span className="hl">Start of game exception</span>: the very first team
                        begins as &quot;Server 2&quot; only — they get just one serve before the
                        other team takes over. This prevents an unfair head-start.
                    </li>
                </ul>

                <p className="subhead subhead-muted">Who is Server 1 when the serve rotates?</p>
                <p style={{ marginBottom: 8 }}>
                    When a team receives the serve,{' '}
                    <span className="hl">
                        Server 1 is always the player currently standing in the right service
                        court
                    </span>
                    . Which player that is depends on how many points that team has scored:
                </p>
                <ul className="rules-list" style={{ marginBottom: 8 }}>
                    <li>
                        <span className="hl">Even score</span> (0, 2, 4…) → players are in their
                        original starting positions. The player who started on the right serves
                        first.
                    </li>
                    <li>
                        <span className="hl">Odd score</span> (1, 3, 5…) → players have swapped
                        sides from scoring, so the other player is now on the right and serves
                        first.
                    </li>
                </ul>
                <p>
                    Players only switch sides within their own court{' '}
                    <span className="hl">when their team scores</span> — never due to losing a
                    rally or a serve rotation. So the score always tells you exactly who&apos;s
                    on which side.
                </p>

                <p className="subhead">Singles</p>
                <ul className="rules-list">
                    <li>
                        <span className="hl">Server scores</span> → keep serving. Switch to the
                        other side of the court (right if score is even, left if odd).
                    </li>
                    <li>
                        <span className="hl">Server loses the rally</span> → serve passes to the
                        opponent. No point is scored.
                    </li>
                </ul>
            </article>

            <article className="rules-section">
                <h3 className="rule-heading">
                    <span className="rule-icon">🔢</span> Scoring
                </h3>
                <p>
                    Only the <span className="hl">serving team</span> can score points. If the
                    receiving team wins the rally, they earn the serve — but no point is scored.
                </p>
                <p>
                    In doubles, the score is called as three numbers:{' '}
                    <span className="hl">
                        serving team score – receiving team score – server number
                    </span>{' '}
                    (e.g. <em>&quot;5-3-2&quot;</em> means serving team has 5, receiving team
                    has 3, and it&apos;s server #2&apos;s turn).
                </p>
                <p>
                    The game starts with the call <span className="hl">&quot;0-0-2&quot;</span>{' '}
                    — the very first team only gets one serve to prevent an unfair serving
                    advantage at the start.
                </p>
            </article>

            <article className="rules-section">
                <h3 className="rule-heading">
                    <span className="rule-icon">🍳</span> The Kitchen Rule
                </h3>
                <p>
                    You <span className="hl">cannot volley</span> (hit the ball in the air
                    without letting it bounce) while standing in the kitchen or stepping on the
                    kitchen line.
                </p>
                <p>
                    You <span className="hl">can</span> enter the kitchen to play a ball that has
                    bounced in there — just make sure you&apos;re back out before volleying
                    again.
                </p>
                <p>
                    This rule keeps players from dominating the net with overhead smashes and is
                    what makes pickleball unique!
                </p>
            </article>

            <article className="rules-section">
                <h3 className="rule-heading">
                    <span className="rule-icon">⚠️</span> Common Faults
                </h3>
                <ul className="rules-list">
                    <li>Hitting the ball out of bounds</li>
                    <li>The ball landing in the kitchen on a serve</li>
                    <li>
                        Volleying from inside the kitchen (or stepping on the kitchen line while
                        volleying)
                    </li>
                    <li>
                        Failing the <span className="hl">two-bounce rule</span>: the serve and
                        return must each bounce once before either team can volley
                    </li>
                    <li>The serve hitting the net or landing out of the service box</li>
                    <li>Hitting the ball before it crosses the net</li>
                </ul>
            </article>

            <article className="rules-section">
                <h3 className="rule-heading">
                    <span className="rule-icon">🏆</span> Winning the Game
                </h3>
                <p>
                    Standard games are played to <span className="hl">11 points</span>, and you
                    must win by <span className="hl">2 points</span>. Tournament games may be
                    played to 15 or 21.
                </p>
                <p>
                    If the score reaches 10-10, play continues until one team leads by 2 — for
                    example, 12-10 or 15-13. There is no cap on the final score.
                </p>
            </article>
        </div>
    );
}
