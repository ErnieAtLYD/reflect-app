'use client'

export function FontTest() {
  return (
    <div className="space-y-6 p-8" data-testid="font-test-container">
      <h1
        className="font-heading text-foreground text-6xl font-bold"
        data-testid="parkinsans-heading"
      >
        Parkinsans Heading
      </h1>

      <p
        className="font-display text-muted-foreground text-2xl"
        data-testid="parkinsans-display"
      >
        This is display text using Parkinsans font
      </p>

      <div
        className="font-body text-foreground text-base"
        data-testid="body-text"
      >
        This is body text using the default sans font (not Parkinsans)
      </div>

      <div className="space-y-2">
        <h2
          className="font-heading text-4xl font-semibold"
          data-testid="heading-medium"
        >
          Medium Heading
        </h2>
        <h3
          className="font-heading text-2xl font-medium"
          data-testid="heading-small"
        >
          Small Heading
        </h3>
      </div>

      <blockquote
        className="font-display border-primary border-l-4 pl-4 text-xl italic"
        data-testid="quote-text"
      >
        &ldquo;This quote uses Parkinsans display font to showcase
        typography&rdquo;
      </blockquote>
    </div>
  )
}
