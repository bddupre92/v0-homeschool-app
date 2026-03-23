"use client"

import type { LessonPacket } from "@/lib/types"

interface LessonPacketPrintViewProps {
  packet: LessonPacket
}

export default function LessonPacketPrintView({ packet }: LessonPacketPrintViewProps) {
  return (
    <div className="print-packet">
      {/* Cover Page */}
      <div className="print-page print-cover">
        <div className="print-cover-content">
          <h1 className="print-cover-title">{packet.title}</h1>
          <div className="print-cover-meta">
            <p className="print-cover-student">Prepared for {packet.childName}</p>
            <p>{packet.subject} &middot; {packet.grade}</p>
            <p className="print-cover-topic">Topic: {packet.topic}</p>
          </div>
          <p className="print-cover-date">
            {new Date(packet.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Student Lesson */}
      <div className="print-page">
        <div className="print-section-header">Student Lesson</div>
        <h2 className="print-h2">{packet.studentLesson?.title}</h2>
        <p className="print-objective"><strong>Objective:</strong> {packet.studentLesson?.objective}</p>

        {packet.studentLesson?.vocabulary?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">Vocabulary</h3>
            <div className="print-vocab-grid">
              {packet.studentLesson.vocabulary.map((word, i) => (
                <div key={i} className="print-vocab-item">
                  <strong>{word.term}</strong> — {word.definition}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="print-subsection">
          <h3 className="print-h3">Reading</h3>
          {packet.studentLesson?.readingContent?.split("\n").map((p, i) => (
            <p key={i} className="print-paragraph">{p}</p>
          ))}
        </div>

        {packet.studentLesson?.keyConcepts?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">Key Concepts</h3>
            <ul className="print-list">
              {packet.studentLesson.keyConcepts.map((concept, i) => (
                <li key={i}>{concept}</li>
              ))}
            </ul>
          </div>
        )}

        {packet.studentLesson?.summary && (
          <div className="print-highlight-box">
            <h3 className="print-h3">Summary</h3>
            <p>{packet.studentLesson.summary}</p>
          </div>
        )}
      </div>

      {/* Worksheet */}
      <div className="print-page">
        <div className="print-section-header">Worksheet</div>
        <h2 className="print-h2">{packet.worksheet?.title}</h2>
        <p className="print-instructions">{packet.worksheet?.instructions}</p>

        {packet.worksheet?.sections?.map((section, i) => (
          <div key={i} className="print-subsection">
            <h3 className="print-h3">{section.sectionTitle}</h3>
            <p className="print-instructions">{section.instructions}</p>
            <div className="print-worksheet-items">
              {section.items?.map((item, j) => (
                <div key={j} className="print-worksheet-item">
                  <p>{j + 1}. {item}</p>
                  {(section.type === "short_answer" || section.type === "writing_prompt") && (
                    <div className="print-answer-lines">
                      <div className="print-answer-line" />
                      <div className="print-answer-line" />
                      {section.type === "writing_prompt" && (
                        <>
                          <div className="print-answer-line" />
                          <div className="print-answer-line" />
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Teacher Guide */}
      <div className="print-page">
        <div className="print-section-header">Teacher / Parent Guide</div>
        <p className="print-time-estimate">Estimated Time: {packet.teacherGuide?.timeEstimate}</p>

        {packet.teacherGuide?.overview && (
          <div className="print-highlight-box">
            <h3 className="print-h3">Overview</h3>
            <p>{packet.teacherGuide.overview}</p>
          </div>
        )}

        {packet.teacherGuide?.preparationSteps?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">Before the Lesson</h3>
            <ol className="print-list-numbered">
              {packet.teacherGuide.preparationSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {packet.teacherGuide?.teachingInstructions?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">Teaching Steps</h3>
            {packet.teacherGuide.teachingInstructions.map((instruction, i) => (
              <div key={i} className="print-teaching-step">
                <div className="print-step-header">
                  <strong>Step {instruction.step}: {instruction.title}</strong>
                  <span className="print-step-duration">({instruction.duration})</span>
                </div>
                <p>{instruction.instructions}</p>
              </div>
            ))}
          </div>
        )}

        {packet.teacherGuide?.discussionQuestions?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">Discussion Questions</h3>
            <ol className="print-list-numbered">
              {packet.teacherGuide.discussionQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </div>
        )}

        {packet.teacherGuide?.assessmentTips?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">Assessment Tips</h3>
            <ul className="print-list">
              {packet.teacherGuide.assessmentTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {packet.teacherGuide?.commonMisconceptions?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">Common Misconceptions</h3>
            <ul className="print-list">
              {packet.teacherGuide.commonMisconceptions.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Materials List */}
      <div className="print-page">
        <div className="print-section-header">Materials List</div>

        {packet.materialsList?.required?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">Required Materials</h3>
            <table className="print-table">
              <thead>
                <tr>
                  <th className="print-checkbox-col"></th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {packet.materialsList.required.map((item, i) => (
                  <tr key={i}>
                    <td className="print-checkbox-col">&#9744;</td>
                    <td>{item.item}</td>
                    <td>{item.quantity}</td>
                    <td>{item.notes || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {packet.materialsList?.optional?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">Optional Materials</h3>
            <table className="print-table">
              <thead>
                <tr>
                  <th className="print-checkbox-col"></th>
                  <th>Item</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {packet.materialsList.optional.map((item, i) => (
                  <tr key={i}>
                    <td className="print-checkbox-col">&#9744;</td>
                    <td>{item.item}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {packet.materialsList?.householdAlternatives?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">Household Alternatives</h3>
            <table className="print-table">
              <thead>
                <tr>
                  <th>Instead of...</th>
                  <th>Use...</th>
                </tr>
              </thead>
              <tbody>
                {packet.materialsList.householdAlternatives.map((alt, i) => (
                  <tr key={i}>
                    <td>{alt.original}</td>
                    <td><strong>{alt.alternative}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Experiment */}
      <div className="print-page">
        <div className="print-section-header">Hands-On Activity</div>
        <h2 className="print-h2">{packet.experiment?.title}</h2>
        <p className="print-objective"><strong>Objective:</strong> {packet.experiment?.objective}</p>

        {packet.experiment?.safetyNotes?.length > 0 && (
          <div className="print-safety-box">
            <h3 className="print-h3">&#9888; Safety Notes</h3>
            <ul className="print-list">
              {packet.experiment.safetyNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        {packet.experiment?.steps?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">Steps</h3>
            {packet.experiment.steps.map((step, i) => (
              <div key={i} className="print-experiment-step">
                <div className="print-step-number">{step.step}</div>
                <div>
                  <p>{step.instruction}</p>
                  {step.tip && <p className="print-tip">Tip: {step.tip}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {packet.experiment?.expectedResults && (
          <div className="print-highlight-box">
            <h3 className="print-h3">Expected Results</h3>
            <p>{packet.experiment.expectedResults}</p>
          </div>
        )}

        {packet.experiment?.scienceConnection && (
          <div className="print-subsection">
            <h3 className="print-h3">Connection to the Lesson</h3>
            <p>{packet.experiment.scienceConnection}</p>
          </div>
        )}
      </div>

      {/* Local Exploration + Extensions */}
      <div className="print-page">
        <div className="print-section-header">Exploration &amp; Extensions</div>

        {packet.localExploration?.fieldTripIdeas?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">Field Trip Ideas</h3>
            {packet.localExploration.fieldTripIdeas.map((trip, i) => (
              <div key={i} className="print-field-trip">
                <strong>{trip.name}</strong> ({trip.type})
                <p>{trip.description}</p>
                <p className="print-tip">Learning Connection: {trip.learningConnection}</p>
              </div>
            ))}
          </div>
        )}

        {packet.localExploration?.atHomeAlternatives?.length > 0 && (
          <div className="print-subsection">
            <h3 className="print-h3">At-Home Alternatives</h3>
            <ul className="print-list">
              {packet.localExploration.atHomeAlternatives.map((alt, i) => (
                <li key={i}>{alt}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="print-subsection">
          <h3 className="print-h3">Extension Activities</h3>

          {packet.extensions?.struggling?.length > 0 && (
            <div className="print-extension-group">
              <h4 className="print-h4">Extra Support</h4>
              <ul className="print-list">
                {packet.extensions.struggling.map((ext, i) => (
                  <li key={i}><strong>{ext.activity}:</strong> {ext.description}</li>
                ))}
              </ul>
            </div>
          )}

          {packet.extensions?.onTrack?.length > 0 && (
            <div className="print-extension-group">
              <h4 className="print-h4">Reinforcement</h4>
              <ul className="print-list">
                {packet.extensions.onTrack.map((ext, i) => (
                  <li key={i}><strong>{ext.activity}:</strong> {ext.description}</li>
                ))}
              </ul>
            </div>
          )}

          {packet.extensions?.advanced?.length > 0 && (
            <div className="print-extension-group">
              <h4 className="print-h4">Challenge</h4>
              <ul className="print-list">
                {packet.extensions.advanced.map((ext, i) => (
                  <li key={i}><strong>{ext.activity}:</strong> {ext.description}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
