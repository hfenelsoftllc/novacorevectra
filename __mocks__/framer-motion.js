const React = require('react');

const filterMotionProps = (props) => {
  if (!props) return {};
  
  const {
    // Animation props
    initial,
    animate,
    exit,
    whileInView,
    whileHover,
    whileTap,
    whileFocus,
    whileDrag,
    
    // Drag props
    drag,
    dragConstraints,
    dragElastic,
    dragMomentum,
    dragPropagation,
    dragSnapToOrigin,
    dragTransition,
    dragControls,
    dragListener,
    
    // Layout props
    layout,
    layoutId,
    layoutDependency,
    layoutScroll,
    layoutRoot,
    
    // Transition props
    transition,
    variants,
    
    // Viewport props
    viewport,
    
    // Style props that might conflict
    style: motionStyle,
    transformTemplate,
    transformValues,
    
    // Event handlers
    onAnimationStart,
    onAnimationComplete,
    onUpdate,
    onDrag,
    onDragStart,
    onDragEnd,
    onDirectionLock,
    onHoverStart,
    onHoverEnd,
    onTap,
    onTapStart,
    onTapCancel,
    onPan,
    onPanStart,
    onPanEnd,
    onViewportEnter,
    onViewportLeave,
    onLayoutAnimationStart,
    onLayoutAnimationComplete,
    onLayoutMeasure,
    onBeforeLayoutMeasure,
    onAnimationDefinition,
    
    // Other motion props
    custom,
    inherit,
    values,
    
    // Filter out any other motion-specific props
    ...filteredProps
  } = props;
  
  return filteredProps;
};

const createMotionComponent = (Component) => {
  return React.forwardRef(({ children, ...props }, ref) => {
    const filteredProps = filterMotionProps(props);
    return React.createElement(Component, { ...filteredProps, ref }, children);
  });
};

module.exports = {
  motion: {
    div: createMotionComponent('div'),
    h1: createMotionComponent('h1'),
    h2: createMotionComponent('h2'),
    h3: createMotionComponent('h3'),
    h4: createMotionComponent('h4'),
    h5: createMotionComponent('h5'),
    h6: createMotionComponent('h6'),
    section: createMotionComponent('section'),
    article: createMotionComponent('article'),
    header: createMotionComponent('header'),
    footer: createMotionComponent('footer'),
    nav: createMotionComponent('nav'),
    main: createMotionComponent('main'),
    button: createMotionComponent('button'),
    a: createMotionComponent('a'),
    span: createMotionComponent('span'),
    p: createMotionComponent('p'),
    ul: createMotionComponent('ul'),
    ol: createMotionComponent('ol'),
    li: createMotionComponent('li'),
    img: createMotionComponent('img'),
    form: createMotionComponent('form'),
    input: createMotionComponent('input'),
    textarea: createMotionComponent('textarea'),
    select: createMotionComponent('select'),
    label: createMotionComponent('label'),
    fieldset: createMotionComponent('fieldset'),
    legend: createMotionComponent('legend'),
  },
  AnimatePresence: ({ children, mode, initial, onExitComplete, ...props }) => children,
  useAnimation: () => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn(),
    set: jest.fn(),
    mount: jest.fn(),
    unmount: jest.fn(),
  }),
  useInView: () => [jest.fn(), true],
  useMotionValue: (initial) => ({
    get: jest.fn(() => initial),
    set: jest.fn(),
    stop: jest.fn(),
    isAnimating: jest.fn(() => false),
    clearListeners: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    onChange: jest.fn(),
  }),
  useTransform: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
  useSpring: (value) => value,
  useScroll: () => ({
    scrollX: { get: jest.fn(() => 0) },
    scrollY: { get: jest.fn(() => 0) },
    scrollXProgress: { get: jest.fn(() => 0) },
    scrollYProgress: { get: jest.fn(() => 0) },
  }),
};