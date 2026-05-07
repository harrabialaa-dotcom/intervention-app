'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const requesterEmailOptions = [
  'abir.abid@valeo.com',
  'abir.jarray@valeo.com',
  'achref.hammami@valeo.com',
  'adem.giga@valeo.com',
  'afifa.mrabet@valeo.com',
  'ahmed.abda@valeo.com',
  'ahmed-baha-eddine.gouta@valeo.com',
  'ahmed.ismail@valeo.com',
  'ajmi.zorgati@valeo.com',
  'alaa.harrabi@valeo.com',
  'ali.ben-fraj@valeo.com',
  'amal.ben-bechir@valeo.com',
  'ameni.hadj-mohamed@valeo.com',
  'amir.bahri@valeo.com',
  'amir.essahli@valeo.com',
  'anis.kaddechi@valeo.com',
  'asma ameur@valeo.com',
  'asma.saidi@valeo.com',
  'aymen.ben-said@valeo.com',
  'aymen.chemkhi@valeo.com',
  'aymen.hassine2@valeo.com',
  'bahri.ben-mansour@valeo.com',
  'bassem.amar@valeo.com',
  'bechir.elfalah@valeo.com',
  'bechir.sahli@valeo.com',
  'bilel.belhadj-amor@valeo.com',
  'chaima.jebri@valeo.com',
  'chiraz.neffati@valeo.com',
  'fahima.knani@valeo.com',
  'fahmi.aamira@valeo.com',
  'ferial.riahi@valeo.com',
  'hanen.ben-abdeljawed@valeo.com',
  'hedi.nasrallah@valeo.com',
  'hichem.ajina@valeo.com',
  'houda.madhi@valeo.com',
  'ines.selmi@valeo.com',
  'intissar.abouda@valeo.com',
  'islem.hmissa@valeo.com',
  'iyed.seboui@valeo.com',
  'jihed.riahi@valeo.com',
  'kaouthar.mahjoubi@valeo.com',
  'khaled.tayari@valeo.com',
  'khalifa.lassoued@valeo.com',
  'khouloud.debbech@valeo.com',
  'lassed.akermi@valeo.com',
  'maha.rached@valeo.com',
  'mahjoub.latrech@valeo.com',
  'mahmoud.nouajaa@valeo.com',
  'marwa.ben-saad@valeo.com',
  'marwa.farhat@valeo.com',
  'marwa.miledi@valeo.com',
  'marwen.dahech@valeo.com',
  'mariem.ben-haj-salah@valeo.com',
  'meriem.ksouri@valeo.com',
  'miled.neili@valeo.com',
  'mohamed-ali.chihi@valeo.com',
  'mohamed-ali.souissi@valeo.com',
  'mohamed-amine.ammar@valeo.com',
  'mohamed.ammar@valeo.com',
  'mohamed.hassine@valeo.com',
  'mohamed.jday@valeo.com',
  'mohamed.kacem@valeo.com',
  'mohamed.maaouia@valeo.com',
  'mohamed.naffeti@valeo.com',
  'mohamed.tahri@valeo.com',
  'mounir.soltani@valeo.com',
  'naceur.boukhili@valeo.com',
  'najem.saihi@valeo.com',
  'nassima.chihi@valeo.com',
  'nesrine.jammali@valeo.com',
  'nidhal.abid@valeo.com',
  'othmen.elbeji@valeo.com',
  'oumayma.slama@valeo.com',
  'rania.neji@valeo.com',
  'riadh.abdeljawed@valeo.com',
  'ridha.ghiloufi@valeo.com',
  'saif-eddine.tayech@valeo.com',
  'salah.amara@valeo.com',
  'salim.monser@valeo.com',
  'sana.abdessaied@valeo.com',
  'sonia.rouatbi@valeo.com',
  'souhir.golli2@valeo.com',
  'souyah.riahi@valeo.com',
  'tarek.bouani@valeo.com',
  'tarek.chouaieb@valeo.com',
  'tarek.touzia@valeo.com',
  'walid.ayed@valeo.com',
  'warda.boudherwa@valeo.com',
  'bechir.ben-houria.ext@valeo.com',
];

export default function CreateRequest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRequesterSuggestions, setShowRequesterSuggestions] = useState(false);
  const [showManagerSuggestions, setShowManagerSuggestions] = useState(false);
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [formData, setFormData] = useState({
    subcontractor: '',
    section: '',
    date: '',
    time: '08:00',
    accompanying: '',
    reason: '',
    demandeurEmail: '',
    n1Email: ''
  });

  const hourOptions = Array.from({ length: 24 }, (_, index) => index);
  const minuteOptions = Array.from({ length: 60 }, (_, index) => index);

  const selectedTime = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;

  const updateSelectedTime = (hour: number, minute: number) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setFormData({ ...formData, time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}` });
  };

  const filteredRequesterEmails = requesterEmailOptions.filter(email =>
    email.toLowerCase().includes(formData.demandeurEmail.toLowerCase())
  ).slice(0, 8);

  const filteredManagerEmails = requesterEmailOptions.filter(email =>
    email.toLowerCase().includes(formData.n1Email.toLowerCase())
  ).slice(0, 8);

  const handleRequesterEmailChange = (value: string) => {
    setFormData({ ...formData, demandeurEmail: value });
    setShowRequesterSuggestions(!!value.trim());
  };

  const handleSelectRequesterEmail = (email: string) => {
    setFormData({ ...formData, demandeurEmail: email });
    setShowRequesterSuggestions(false);
  };

  const handleManagerEmailChange = (value: string) => {
    setFormData({ ...formData, n1Email: value });
    setShowManagerSuggestions(!!value.trim());
  };

  const handleSelectManagerEmail = (email: string) => {
    setFormData({ ...formData, n1Email: email });
    setShowManagerSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      router.push('/');
    } else {
      alert('Failed to create request');
      setLoading(false);
    }
  };

  return (
    <div className="container create-container">
      <div className="page-header">
        <h2 className="page-title">New Involvement Request</h2>
        <p className="page-subtitle">Fill in the details to create a new authorization request</p>
      </div>
      
      <form onSubmit={handleSubmit} className="card form-card">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Subcontractor / External Body *</label>
            <input required type="text" className="form-input" value={formData.subcontractor} onChange={e => setFormData({...formData, subcontractor: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Section / Service *</label>
            <input required type="text" className="form-input" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input required type="date" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Time *</label>
            <div className="time-selector">
              <div className="time-display">
                <span className="time-value">{selectedTime}</span>
                <span className="time-icon">🕒</span>
              </div>
              <div className="time-columns">
                <div className="time-column">
                  <span className="time-column-label">Hour</span>
                  <div className="time-scroll">
                    {hourOptions.map(hour => (
                      <button
                        key={hour}
                        type="button"
                        className={`time-option ${selectedHour === hour ? 'active' : ''}`}
                        onClick={() => updateSelectedTime(hour, selectedMinute)}
                      >
                        {hour.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="time-column">
                  <span className="time-column-label">Minute</span>
                  <div className="time-scroll">
                    {minuteOptions.map(minute => (
                      <button
                        key={minute}
                        type="button"
                        className={`time-option ${selectedMinute === minute ? 'active' : ''}`}
                        onClick={() => updateSelectedTime(selectedHour, minute)}
                      >
                        {minute.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <input type="hidden" name="time" value={formData.time} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Accompanying Person (Optional)</label>
            <input type="text" className="form-input" value={formData.accompanying} onChange={e => setFormData({...formData, accompanying: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Intervention *</label>
            <input required type="text" className="form-input" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
          </div>

          <div className="form-section-divider">
            <h3 className="section-title">Workflow Emails</h3>
          </div>

          <div className="form-group suggestions-group" onBlur={() => setTimeout(() => setShowRequesterSuggestions(false), 150)}>
            <label className="form-label">Requester Email (To receive final PDF) *</label>
            <input
              required
              type="email"
              className="form-input"
              autoComplete="off"
              value={formData.demandeurEmail}
              onChange={e => handleRequesterEmailChange(e.target.value)}
              onFocus={() => setShowRequesterSuggestions(!!formData.demandeurEmail.trim())}
            />
            {showRequesterSuggestions && filteredRequesterEmails.length > 0 && (
              <div className="suggestions-list">
                {filteredRequesterEmails.map(email => (
                  <button
                    type="button"
                    key={email}
                    className={`suggestion-item ${formData.demandeurEmail === email ? 'selected' : ''}`}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleSelectRequesterEmail(email)}
                  >
                    <span className="suggestion-checkbox">✓</span>
                    <span>{email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-group suggestions-group" onBlur={() => setTimeout(() => setShowManagerSuggestions(false), 150)}>
            <label className="form-label">N+1 Manager Email (To start approval) *</label>
            <input
              required
              type="email"
              className="form-input"
              autoComplete="off"
              value={formData.n1Email}
              onChange={e => handleManagerEmailChange(e.target.value)}
              onFocus={() => setShowManagerSuggestions(!!formData.n1Email.trim())}
            />
            {showManagerSuggestions && filteredManagerEmails.length > 0 && (
              <div className="suggestions-list">
                {filteredManagerEmails.map(email => (
                  <button
                    type="button"
                    key={email}
                    className={`suggestion-item ${formData.n1Email === email ? 'selected' : ''}`}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleSelectManagerEmail(email)}
                  >
                    <span className="suggestion-checkbox">✓</span>
                    <span>{email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">Review dashboard</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
