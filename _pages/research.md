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

    <!-- IMAGE SCROLLER — place your figure(s) inside -->
    <!-- Put images inside /assets/img/ then update src path -->
    <div class="paper-image-scroller">
      <img src="/assets/img/YOUR_IMAGE.png" alt="SurgXBench figure">
      <!-- Add more for horizontal scroll
      <img src="/assets/img/YOUR_IMAGE_2.png" alt="">
      -->
    </div>

    <div class="paper-info">
      <h3><strong>SurgXBench:</strong> Explainable Vision-Language Model Benchmark for Surgery</h3>
      <p><em>Jiajun Cheng, Xianwu Zhao, Sainan Liu, Xiaofan Yu, Ravi Prakash, Patrick Codd, Jonathan Katz, Shan Lin</em></p>
      <p><strong>Accepted to WACV 2026</strong></p>

      <p>
        SurgXBench introduces the first explainability-driven benchmark for Vision-Language Models 
        in robotic surgery. We evaluate general & surgical VLMs on instrument and action recognition, 
        integrate Grad-CAM & causal reasoning visualizations, and propose new attention-alignment 
        metrics to measure whether models focus on clinically meaningful cues. Our findings reveal 
        reliability gaps between accuracy and reasoning quality — highlighting the need for stronger 
        visual grounding in future surgical VLMs.
      </p>

      <p class="paper-links">
        <a class="btn" href="YOUR_ARXIV_LINK" target="_blank">📄 Paper</a>
        <a class="btn secondary" href="https://github.com/jiajun344/SurgXBench-Explainable-Vision-Language-Model-Benchmark-for-Surgery" target="_blank">💻 Code</a>
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
  max-height: 2



