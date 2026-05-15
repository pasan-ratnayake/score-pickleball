import './CourtDiagram.css';

export function CourtDiagram() {
    return (
        <div id="court-diagram" role="img" aria-label="Pickleball court diagram">
            <div className="nvz-top" />
            <div className="nvz-bot" />
            <div className="net" />
            <span className="lbl-baseline-top">Baseline</span>
            <span className="lbl-nvz-top">Kitchen (NVZ)</span>
            <span className="lbl-net">— Net —</span>
            <span className="lbl-nvz-bot">Kitchen (NVZ)</span>
            <span className="lbl-baseline-bot">Baseline</span>
            <span className="lbl-svc-top">Service Boxes</span>
            <span className="lbl-svc-bot">Service Boxes</span>
        </div>
    );
}
