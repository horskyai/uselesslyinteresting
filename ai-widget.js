(function() {

  function getArticleSlug() {
    var parts = window.location.pathname.split('/');
    var last = parts[parts.length - 1];
    return last.replace('.html', '');
  }

  var slug = getArticleSlug();

  // Inject styles
  var style = document.createElement('style');
  style.textContent = `
    .ai-widget {
      margin: 2.5rem auto;
      max-width: 720px;
      padding: 0 1.5rem;
    }
    .ai-widget-label {
      font-family: 'DM Mono', monospace;
      font-size: 0.68rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--muted, #5c5c72);
      margin-bottom: 0.75rem;
    }
    .ai-widget-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .ai-tab-btn {
      background: transparent;
      border: 1px solid var(--border, rgba(90,138,0,0.2));
      color: var(--accent, #5a8a00);
      padding: 0.5rem 1.1rem;
      font-family: 'DM Mono', monospace;
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.15s;
      border-radius: 2px;
    }
    .ai-tab-btn:hover, .ai-tab-btn.active {
      background: var(--accent, #5a8a00);
      color: var(--bg, #f5f5f0);
    }
    .ai-panel {
      background: var(--surface, #eaeae4);
      border: 1px solid var(--border, rgba(90,138,0,0.15));
      padding: 1.5rem;
      display: none;
      border-radius: 3px;
    }
    .ai-panel.active { display: block; }
    .ai-result-box {
      background: var(--card, #fff);
      border: 1px solid var(--border, rgba(90,138,0,0.15));
      padding: 1rem 1.2rem;
      border-radius: 2px;
      font-size: 0.9rem;
      line-height: 1.75;
      color: var(--text, #1a1a2e);
    }
    .quiz-question { margin-bottom: 1.2rem; }
    .quiz-question p {
      font-weight: 600;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: var(--text, #1a1a2e);
    }
    .quiz-option {
      display: block;
      width: 100%;
      text-align: left;
      background: var(--card, #fff);
      border: 1px solid var(--border, rgba(90,138,0,0.2));
      color: var(--text, #1a1a2e);
      padding: 0.5rem 0.9rem;
      margin-bottom: 0.4rem;
      font-family: 'DM Mono', monospace;
      font-size: 0.78rem;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.15s;
    }
    .quiz-option:hover:not(:disabled) { background: var(--card-hover, #f0f0ea); }
    .quiz-option.correct { background: rgba(90,138,0,0.15); border-color: var(--accent, #5a8a00); color: var(--accent, #5a8a00); font-weight: 600; }
    .quiz-option.wrong { background: rgba(196,22,140,0.1); border-color: var(--accent2, #c4168c); color: var(--accent2, #c4168c); }
    .quiz-score {
      margin-top: 1rem;
      font-family: 'DM Mono', monospace;
      font-size: 0.85rem;
      color: var(--accent, #5a8a00);
      letter-spacing: 0.05em;
    }
    .recommend-form {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .recommend-input {
      flex: 1;
      min-width: 180px;
      background: var(--card, #fff);
      border: 1px solid var(--border, rgba(90,138,0,0.2));
      color: var(--text, #1a1a2e);
      padding: 0.5rem 0.8rem;
      font-family: 'DM Mono', monospace;
      font-size: 0.8rem;
      border-radius: 2px;
      outline: none;
    }
    .recommend-input:focus { border-color: var(--accent, #5a8a00); }
    .recommend-input::placeholder { color: var(--muted, #5c5c72); }
    .recommend-card {
      display: block;
      background: var(--card, #fff);
      border: 1px solid var(--border, rgba(90,138,0,0.15));
      padding: 0.8rem 1rem;
      margin-bottom: 0.5rem;
      border-radius: 2px;
      text-decoration: none;
      color: var(--text, #1a1a2e);
      font-size: 0.85rem;
      transition: background 0.15s;
    }
    .recommend-card:hover { background: var(--card-hover, #f0f0ea); }
    .recommend-card span {
      display: block;
      font-family: 'DM Mono', monospace;
      font-size: 0.7rem;
      color: var(--accent, #5a8a00);
      margin-top: 0.2rem;
      letter-spacing: 0.05em;
    }
    .ai-muted {
      color: var(--muted, #5c5c72);
      font-family: 'DM Mono', monospace;
      font-size: 0.8rem;
    }
  `;
  document.head.appendChild(style);

  // Build widget HTML
  var widget = document.createElement('div');
  widget.className = 'ai-widget';
  widget.innerHTML = `
    <div class="ai-widget-label">✦ Interactive</div>
    <div class="ai-widget-tabs">
      <button class="ai-tab-btn active" onclick="aiSwitchTab('eli5', this)">🧒 Explain like I'm 5</button>
      <button class="ai-tab-btn" onclick="aiSwitchTab('quiz', this)">🎯 Test yourself</button>
      <button class="ai-tab-btn" onclick="aiSwitchTab('recommend', this)">🔍 I want more on...</button>
    </div>
    <div id="ai-panel-eli5" class="ai-panel active">
      <div id="eli5-content"></div>
    </div>
    <div id="ai-panel-quiz" class="ai-panel">
      <div id="quiz-content"></div>
    </div>
    <div id="ai-panel-recommend" class="ai-panel">
      <div class="recommend-form">
        <input class="recommend-input" id="recommend-input" type="text" placeholder="e.g. brain, ocean, memory..." />
        <button class="ai-tab-btn" onclick="aiDoRecommend()">Find articles</button>
      </div>
      <div id="recommend-content"></div>
    </div>
  `;

  var footer = document.querySelector('.article-footer-nav') || document.querySelector('footer');
  if (footer) footer.parentNode.insertBefore(widget, footer);
  else document.body.appendChild(widget);

  // Tab switcher
  window.aiSwitchTab = function(tab, btn) {
    document.querySelectorAll('.ai-panel').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.ai-tab-btn').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById('ai-panel-' + tab).classList.add('active');
    btn.classList.add('active');
  };

  // Load data and render
  // Works from both /articles/ and /articles/lang/ paths
  var dataPath = window.location.pathname.match(/\/articles\/[a-z]{2}\//) ? '../../articles-data.json' : '../articles-data.json';
  fetch(dataPath)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var d = data[slug];
      if (!d) return;

      // ELI5
      var eli5El = document.getElementById('eli5-content');
      if (d.eli5) {
        eli5El.innerHTML = '<div class="ai-result-box">' + d.eli5 + '</div>';
      } else {
        eli5El.innerHTML = '<p class="ai-muted">Not available for this article.</p>';
      }

      // Quiz
      var quizEl = document.getElementById('quiz-content');
      if (d.quiz && d.quiz.length) {
        window._quizAnswered = {};
        window._quizCorrect = 0;
        window._quizTotal = d.quiz.length;
        var html = '';
        d.quiz.forEach(function(q, qi) {
          html += '<div class="quiz-question" id="q-' + qi + '">';
          html += '<p>' + (qi+1) + '. ' + q.question + '</p>';
          q.options.forEach(function(opt, oi) {
            html += '<button class="quiz-option" onclick="aiAnswer(' + qi + ',' + oi + ',' + q.correct + ')">' + opt + '</button>';
          });
          html += '</div>';
        });
        html += '<div class="quiz-score" id="quiz-score" style="display:none"></div>';
        quizEl.innerHTML = html;
      } else {
        quizEl.innerHTML = '<p class="ai-muted">Not available for this article.</p>';
      }
    })
    .catch(function() {});

  window.aiAnswer = function(qi, oi, correct) {
    var qDiv = document.getElementById('q-' + qi);
    var btns = qDiv.querySelectorAll('.quiz-option');
    if (window._quizAnswered[qi]) return;
    window._quizAnswered[qi] = true;
    btns.forEach(function(b, i) {
      b.disabled = true;
      if (i === correct) b.classList.add('correct');
      else if (i === oi) b.classList.add('wrong');
    });
    if (oi === correct) window._quizCorrect++;
    if (Object.keys(window._quizAnswered).length === window._quizTotal) {
      var s = document.getElementById('quiz-score');
      s.style.display = 'block';
      s.textContent = '✓ Score: ' + window._quizCorrect + ' / ' + window._quizTotal;
    }
  };

  // Article list for recommendations (keyword-based matching)
  var allArticles = [
    { slug: 'your-brain-predicts-the-future-10-seconds-ahead', title: 'Your Brain Predicts the Future 10 Seconds Ahead', keywords: ['brain','neuroscience','prediction','consciousness','future','mind','neural','cognitive'] },
    { slug: 'trees-send-messages-through-underground-fungal-network', title: 'Trees Send Messages Through an Underground Fungal Network', keywords: ['trees','fungi','forest','nature','plants','network','underground','wood wide web'] },
    { slug: 'there-are-colors-no-human-has-ever-seen', title: 'There Are Colors No Human Has Ever Seen', keywords: ['colors','vision','perception','eyes','light','spectrum','tetrachromat','science'] },
    { slug: 'bacteria-in-your-gut-are-controlling-your-thoughts', title: 'The Bacteria in Your Gut Are Controlling Your Thoughts', keywords: ['gut','bacteria','microbiome','brain','serotonin','biology','health','mood','thoughts'] },
    { slug: 'crows-remember-your-face-and-tell-their-friends', title: 'Crows Remember Your Face — And They Tell Their Friends', keywords: ['crows','birds','animals','intelligence','memory','social','friends'] },
    { slug: 'time-moves-faster-for-your-face-than-your-feet', title: 'Time Moves Faster for Your Face Than Your Feet', keywords: ['time','physics','relativity','einstein','gravity','space','gps','clock'] },
    { slug: 'insects-are-disappearing-so-fast-nobody-noticed', title: 'Insects Are Disappearing So Fast Nobody Noticed', keywords: ['insects','environment','extinction','nature','ecology','bees','butterflies','climate'] },
    { slug: 'thc-creates-false-memories-your-brain-is-lying', title: 'THC Can Create Memories That Never Happened', keywords: ['memory','cannabis','thc','brain','psychology','false memories','drugs'] },
    { slug: 'cancer-is-not-random-genetic-program-decides', title: "Cancer Isn't Random — A Hidden Genetic Program Decides", keywords: ['cancer','genetics','biology','dna','science','tumor','genes','medicine'] },
    { slug: 'bull-sharks-have-friends-and-choose-them-carefully', title: 'Bull Sharks Have Friends — And Choose Them Carefully', keywords: ['sharks','animals','social','friendship','ocean','fish','marine','water'] },
    { slug: 'hedgehogs-hear-ultrasound-secret-superpower', title: "Hedgehogs Hear Sounds Humans Can't", keywords: ['hedgehogs','animals','hearing','ultrasound','superpower','sound','senses'] },
    { slug: 'mind-bending-science-facts-that-sound-fake', title: '20 Mind-Bending Science Facts That Sound Completely Fake', keywords: ['science','facts','weird','interesting','physics','biology','space','chemistry'] },
    { slug: '30-useless-facts-that-will-blow-your-mind', title: '30 Useless Facts That Will Blow Your Mind', keywords: ['facts','weird','interesting','useless','mind','random','trivia'] },
    { slug: 'bizarre-animal-facts-you-never-learned-in-school', title: 'Bizarre Animal Facts You Never Learned in School', keywords: ['animals','facts','weird','biology','nature','bizarre','school'] }
  ];

  window.aiDoRecommend = function() {
    var topic = (document.getElementById('recommend-input').value || '').toLowerCase().trim();
    if (!topic) return;
    var words = topic.split(/\s+/);
    var scores = allArticles
      .filter(function(a) { return a.slug !== slug; })
      .map(function(a) {
        var score = 0;
        words.forEach(function(w) {
          a.keywords.forEach(function(k) {
            if (k.includes(w) || w.includes(k)) score++;
          });
          if (a.title.toLowerCase().includes(w)) score += 2;
        });
        return { article: a, score: score };
      })
      .sort(function(a, b) { return b.score - a.score })
      .slice(0, 3);

    var html = '';
    scores.forEach(function(s) {
      var a = s.article;
      html += '<a href="/articles/' + a.slug + '.html" class="recommend-card">' + a.title + '<span>READ ARTICLE →</span></a>';
    });
    document.getElementById('recommend-content').innerHTML = html || '<p class="ai-muted">No matches found. Try different keywords.</p>';
  };

  document.addEventListener('DOMContentLoaded', function() {
    var inp = document.getElementById('recommend-input');
    if (inp) inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') window.aiDoRecommend(); });
  });

})();
