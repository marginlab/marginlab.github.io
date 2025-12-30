---
title: "MARGIN Lab - Research"
layout: textlay
excerpt: "MARGIN Lab -- Research"
sitemap: false
permalink: /research/
---


---

##  Recent Works

<section class="paper-highlight">
  <article class="paper-card">

    <!-- IMAGE SCROLLER — uses two images -->
    <div class="paper-image-scroller">
      <img src="/images/SurgXBench(1).png" alt="SurgXBench Figure 1">
      <img src="/images/SurgXBench(2).png" alt="SurgXBench Figure 2">
    </div>

    <div class="paper-info">
      <h3><strong>SurgXBench:</strong> Explainable Vision-Language Model Benchmark for Surgery</h3>
      <p><em>Jiajun Cheng, Xianwu Zhao, Sainan Liu, Xiaofan Yu, Ravi Prakash, Patrick Codd, Jonathan Katz, Shan Lin</em></p>
      <p><strong>Accepted to WACV 2026</strong></p>

      <p>
        SurgXBench introduces the first explainability-driven benchmark for Vision-Language Models
        in robotic surgery. We evaluate general & surgical VLMs for instrument and action recognition,
        integrate Grad-CAM & causal reasoning visualizations, and propose new attention-alignment
        metrics to measure whether models attend to clinically meaningful cues. Our findings reveal a
        performance–reasoning gap, highlighting the need for future models with stronger visual grounding.
      </p>

      <p class="paper-links">
        <a class="btn" href="YOUR_ARXIV_OR_PAPER_LINK" target="_blank">📄 Paper (Coming Soon)</a>
        <a class="btn secondary" href="https://github.com/jiajun344/SurgXBench-Explainable-Vision-Language-Model-Benchmark-for-Surgery" target="_blank">💻 GitHub Code</a>
      </p>
    </div>

  </article>
</section>


---

<style>
.paper-highlight { margin-top: 1.5rem; }

.paper-card {
  display: flex; flex-wrap: wrap; gap: 1.2rem;
  padding: 1.2rem; border-radius: 12px;
  border: 1px solid #e7e7e7; background:#fafafa;
}

.paper-image-scroller {
  flex: 1 1 260px; max-width: 360px;
  overflow-x: auto; white-space: nowrap;
  border-radius: 10px;
}

.paper-image-scroller img {
  max-height: 220px; margin-right: 8px;
  border-radius: 10px; display:inline-block;
}

.paper-info { flex: 2 1 280px; }
.paper-info h3 { margin: 0 0 0.3rem; }

.paper-links .btn {
  display:inline-block; padding:.45rem .9rem;
  border-radius:50px; text-decoration:none;
  border:1px solid #333; margin-right:.5rem;
  font-size:0.9rem;
}
.btn.secondary { opacity:0.8; }
</style>


