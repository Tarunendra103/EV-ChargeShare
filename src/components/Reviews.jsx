import React, { useState } from 'react';
import { useApp } from '../App.jsx';

export default function Reviews() {
  const { db, addReview, incrementHelpful } = useApp();
  const reviews = db.reviews;
  const chargers = db.chargers;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChargerId, setSelectedChargerId] = useState(chargers[0]?.id || '');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dynamic calculations
  const countReviews = reviews.length;
  const averageRating = countReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / countReviews).toFixed(1)
    : "0.0";

  const starsGroupCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (starsGroupCount[r.rating] !== undefined) {
      starsGroupCount[r.rating]++;
    }
  });

  const getPercentage = (stars) => {
    if (countReviews === 0) return 0;
    return Math.round((starsGroupCount[stars] / countReviews) * 100);
  };

  const handleHelpfulClick = (reviewId) => {
    incrementHelpful(reviewId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const tags = ['Reliable'];
      if (rating === 5) tags.push('Fast Charging');
      if (reviewText.toLowerCase().includes('help') || reviewText.toLowerCase().includes('marcus') || reviewText.toLowerCase().includes('alex')) {
        tags.push('Great Host');
      }

      addReview(selectedChargerId, rating, reviewText, tags);

      // Reset
      setReviewText('');
      setRating(5);
      setIsModalOpen(false);
      setSubmitting(false);
    }, 1000);
  };

  return (
    <main className="pt-6 pb-32 lg:px-12 px-gutter-mobile min-h-screen max-w-6xl mx-auto space-y-10 text-on-surface">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary-container mb-2 font-black tracking-tight">Community Feedback</h2>
          <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed">Real driver feedback from charger sessions. Transparency drives our peer-to-peer ecosystem forward.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full text-xs font-bold glow-green hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,135,0.2)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base material-symbols-fill">rate_review</span> Write a Review
          </button>
        </div>
      </div>

      {/* Ratings Summary Stats Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Average Ratings Box */}
        <div className="md:col-span-5 glass-card rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-container/5 rounded-full blur-3xl"></div>
          <div className="flex items-baseline gap-2 mb-2 z-10">
            <span className="text-6xl font-black text-primary-container tracking-tighter">{averageRating}</span>
            <span className="text-on-surface-variant font-medium text-sm">/ 5.0</span>
          </div>
          <div className="flex gap-1.5 mb-4 z-10 text-primary-container">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span 
                key={idx} 
                className={`material-symbols-outlined text-lg ${
                  idx < Math.round(parseFloat(averageRating)) ? 'material-symbols-fill' : ''
                }`}
              >
                star
              </span>
            ))}
          </div>
          <p className="text-on-surface-variant font-label-md text-xs uppercase tracking-wider z-10">Based on {countReviews} verified sessions</p>
        </div>

        {/* Distributions bar graphs */}
        <div className="md:col-span-7 glass-card rounded-3xl p-6 md:p-8">
          <h3 className="font-label-md text-xs text-primary-container uppercase tracking-widest mb-6 font-bold">Rating Distribution</h3>
          <div className="space-y-3.5">
            {[5, 4, 3, 2, 1].map(stars => (
              <div key={stars} className="flex items-center gap-4">
                <span className="w-12 text-xs font-label-md text-on-surface-variant">{stars} Star</span>
                <div className="flex-grow h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-container progress-bar-glow transition-all duration-1000" 
                    style={{ width: `${getPercentage(stars)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs opacity-50">{getPercentage(stars)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed of Review items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="reviews-feed-container">
        {reviews.length === 0 ? (
          <div className="col-span-2 glass-card rounded-3xl p-8 text-center text-on-surface-variant">
            <p className="italic">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          reviews.map(rev => (
            <article key={rev.id} className="glass-card rounded-3xl p-6 transition-all hover:translate-y-[-4px] flex flex-col justify-between" id={`review-card-${rev.id}`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img className="w-11 h-11 rounded-full border border-primary-container/30 object-cover" src={rev.avatar} alt={rev.userName}/>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm leading-tight">{rev.userName}</h4>
                      <p className="text-[10px] text-on-surface-variant font-label-md uppercase tracking-wider">Verified Driver</p>
                    </div>
                  </div>
                  <div className="flex text-primary-container">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`material-symbols-outlined text-base ${
                          idx < rev.rating ? 'material-symbols-fill' : ''
                        }`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>

                {/* Review Tag Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {rev.tags ? (
                    typeof rev.tags === 'string' ? (
                      rev.tags.split(',').map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-primary-container/10 text-primary-container text-[9px] font-label-sm border border-primary-container/10 uppercase font-bold tracking-wider">
                          {tag.trim()}
                        </span>
                      ))
                    ) : (
                      rev.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-primary-container/10 text-primary-container text-[9px] font-label-sm border border-primary-container/10 uppercase font-bold tracking-wider">
                          {tag}
                        </span>
                      ))
                    )
                  ) : null}
                </div>
                
                <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
                  "{rev.text}"
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                <span className="text-[11px] text-on-surface-variant opacity-50">{rev.date} • {rev.location}</span>
                <button 
                  onClick={() => handleHelpfulClick(rev.id)}
                  className="flex items-center gap-1 text-[11px] hover:text-primary-container text-on-surface-variant transition-colors btn-helpful-vote font-semibold" 
                  data-id={rev.id}
                >
                  <span className="material-symbols-outlined text-sm">thumb_up</span> Helpful ({rev.helpfulCount})
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Floating Write Review Modal */}
      {isModalOpen && (
        <div id="modal-review-form" className="fixed inset-0 z-50 flex items-center justify-center px-gutter-mobile bg-surface-container-lowest/70 backdrop-blur-md">
          <div className="glass-modal w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-lg-mobile text-lg font-black text-primary">Write A Review</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="material-symbols-outlined text-on-surface-variant hover:text-on-surface p-1 rounded-full bg-white/5 active:scale-95 transition-all"
              >
                close
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {/* Charger dropdown select */}
              <div className="space-y-1">
                <label className="block font-label-md text-xs text-on-surface-variant uppercase tracking-wide">Select Charger Visited</label>
                <select 
                  value={selectedChargerId}
                  onChange={(e) => setSelectedChargerId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-on-surface font-body-md glass-input bg-surface-container-highest"
                >
                  {chargers.map(c => (
                    <option key={c.id} value={c.id} className="bg-surface-container-high">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star ratings selection */}
              <div className="space-y-1.5">
                <label className="block font-label-md text-xs text-on-surface-variant uppercase tracking-wide">Rating Score</label>
                <div className="flex gap-2 text-on-surface-variant hover:text-yellow-500 cursor-pointer text-2xl" id="star-selector-row">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <span 
                      key={score}
                      onClick={() => setRating(score)}
                      className={`material-symbols-outlined hover:scale-110 star-choice ${
                        score <= rating ? 'text-yellow-500 material-symbols-fill' : 'text-on-surface-variant'
                      }`}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>

              {/* Review text input */}
              <div className="space-y-1">
                <label className="block font-label-md text-xs text-on-surface-variant uppercase tracking-wide">Comments</label>
                <textarea 
                  required 
                  rows="4" 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-on-surface font-body-md glass-input placeholder:opacity-30 resize-none text-sm" 
                  placeholder="Tell us about the charging speed, location accessibility, host helpfulness..."
                />
              </div>

              {/* Submit button */}
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-container text-on-primary-container py-3.5 rounded-xl font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,255,135,0.2)]"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
