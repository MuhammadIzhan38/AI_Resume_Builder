document.addEventListener('DOMContentLoaded', function() {
    // Drag and drop functionality
    const sections = document.querySelectorAll('.form-section');
    let draggedSection = null;

    sections.forEach(section => {
        section.addEventListener('dragstart', function() {
            draggedSection = this;
            setTimeout(() => {
                this.classList.add('dragging');
            }, 0);
        });

        section.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });

    const form = document.querySelector('.resume-form');
    form.addEventListener('dragover', function(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(form, e.clientY);
        if (afterElement == null) {
            form.appendChild(draggedSection);
        } else {
            form.insertBefore(draggedSection, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.form-section:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Add experience entry
    document.getElementById('add-experience').addEventListener('click', function() {
        const experienceSection = this.parentElement;
        const newEntry = document.createElement('div');
        newEntry.className = 'experience-entry';
        newEntry.innerHTML = `
            <input type="text" class="job-title" placeholder="Job Title">
            <input type="text" class="company" placeholder="Company">
            <input type="text" class="duration" placeholder="Duration">
            <textarea class="description" placeholder="Job Description"></textarea>
            <button class="ai-suggest" data-for="experience">Improve with AI</button>
        `;
        experienceSection.insertBefore(newEntry, this);
    });

    // Add skills
    document.getElementById('add-skill').addEventListener('click', function() {
        const skillInput = document.getElementById('skills-input');
        const skillsList = document.getElementById('skills-list');
        
        if (skillInput.value.trim() !== '') {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skillInput.value;
            skillsList.appendChild(skillTag);
            skillInput.value = '';
        }
    });

    // AI Suggestions
    const modal = document.getElementById('ai-modal');
    const span = document.getElementsByClassName('close')[0];
    const aiSuggestions = document.getElementById('ai-suggestions');
    let currentField = '';

    document.querySelectorAll('.ai-suggest').forEach(button => {
        button.addEventListener('click', function() {
            currentField = this.getAttribute('data-for');
            const fieldContent = getFieldContent(currentField);
            
            // In a real app, you would call your backend API here
            // For now, we'll simulate a response
            simulateAIResponse(fieldContent);
            
            modal.style.display = 'block';
        });
    });

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    document.getElementById('apply-suggestion').addEventListener('click', function() {
        // In a real app, you would apply the selected suggestion
        alert('Suggestion applied!');
        modal.style.display = 'none';
    });

    function getFieldContent(field) {
        switch(field) {
            case 'summary':
                return document.getElementById('summary').value;
            case 'experience':
                // Get the last experience entry's description
                const experiences = document.querySelectorAll('.experience-entry');
                const lastExperience = experiences[experiences.length - 1];
                return lastExperience.querySelector('.description').value;
            default:
                return '';
        }
    }

    function simulateAIResponse(content) {
        // This is just a simulation - in a real app, you'd call the OpenAI API
        const responses = {
            summary: [
                "Consider starting with a strong action word and quantifying your achievements.",
                "Try to align your summary more closely with the job description keywords.",
                "Your summary could benefit from more specific metrics about your impact."
            ],
            experience: [
                "Reformat your bullet points to start with action verbs and include measurable results.",
                "Consider adding more context about the scale of your projects or responsibilities.",
                "This could be strengthened by showing progression or promotion if applicable."
            ]
        };

        aiSuggestions.innerHTML = '';
        responses[currentField].forEach((suggestion, index) => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'suggestion';
            suggestionDiv.innerHTML = `
                <input type="radio" id="suggestion-${index}" name="ai-suggestion" value="${index}">
                <label for="suggestion-${index}">${suggestion}</label>
            `;
            aiSuggestions.appendChild(suggestionDiv);
        });
    }

    // Preview Resume
    document.getElementById('preview-resume').addEventListener('click', function() {
        // In a real app, you would generate a proper preview
        const previewContent = document.getElementById('preview-content');
        previewContent.innerHTML = `
            <h3>${document.getElementById('name').value || 'Your Name'}</h3>
            <p>${document.getElementById('email').value || 'email@example.com'} | 
               ${document.getElementById('phone').value || '(123) 456-7890'}</p>
            <h4>Professional Summary</h4>
            <p>${document.getElementById('summary').value || 'Experienced professional seeking new opportunities.'}</p>
            <h4>Work Experience</h4>
            <div class="preview-experience">
                ${Array.from(document.querySelectorAll('.experience-entry')).map(exp => `
                    <h5>${exp.querySelector('.job-title').value || 'Job Title'} at ${exp.querySelector('.company').value || 'Company'}</h5>
                    <p>${exp.querySelector('.duration').value || 'Duration'}</p>
                    <p>${exp.querySelector('.description').value || 'Job description and accomplishments.'}</p>
                `).join('')}
            </div>
        `;
    });

    // Analyze Resume
    document.getElementById('analyze-resume').addEventListener('click', function() {
        // In a real app, you would call your backend API for analysis
        alert('In a complete app, this would analyze your resume for ATS compatibility and suggest improvements.');
    });

    // Download PDF
    document.getElementById('download-pdf').addEventListener('click', function() {
        // In a real app, you would generate a PDF
        alert('In a complete app, this would generate and download a PDF of your resume.');
    });
});